import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import {
  save_active_session,
  get_active_session,
  clear_active_session,
  get_pending_completed,
  clear_pending_completed,
  ActiveSession,
} from '../storage/sessionManager';
import { saveSession, getSessions, FocusSession, SessionTag } from '../storage/sessionStorage';
import { get_settings, AppSettings, DEFAULT_SETTINGS } from '../storage/settingsStorage';
import LiveActivityModule from '../native/LiveActivityModule';
import { SoundOption } from '../components/SoundPlayer';

// Completion chime URL (free, royalty-free)
const COMPLETION_SOUND_URI = 'https://cdn.pixabay.com/audio/2022/11/21/audio_dc39bbb00e.mp3';

export type SessionPhase =
  | 'idle'           // no session, show start button
  | 'preparing'      // user tapped start, "put phone away" prompt
  | 'focusing'       // session active (phone is locked/face-down)
  | 'summary';       // user returned, show session result

export interface SessionState {
  phase: SessionPhase;
  elapsed_seconds: number;
  start_time: number | null;
  summary_duration: number;
  summary_start_time: number;
  summary_tag?: SessionTag;
  selected_tag: SessionTag;
  selected_sound: SoundOption;
}

export interface SessionActions {
  start_session: () => void;
  dismiss_summary: () => void;
  stop_session: () => void;
  set_tag: (tag: SessionTag) => void;
  set_sound: (sound: SoundOption) => void;
}

export const useSessionManager = () => {
  const [phase, set_phase] = useState<SessionPhase>('idle');
  const [elapsed_seconds, set_elapsed_seconds] = useState(0);
  const [start_time, set_start_time] = useState<number | null>(null);
  const [summary_duration, set_summary_duration] = useState(0);
  const [summary_start_time, set_summary_start_time] = useState(0);
  const [summary_tag, set_summary_tag] = useState<SessionTag | undefined>(undefined);
  const [selected_tag, set_selected_tag] = useState<SessionTag>('work');
  const [selected_sound, set_selected_sound] = useState<SoundOption>('none');
  const [settings, set_settings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sessions, set_sessions] = useState<FocusSession[]>([]);

  const timer_ref = useRef<NodeJS.Timeout | null>(null);
  const phase_ref = useRef<SessionPhase>('idle');
  const completion_sound_ref = useRef<Audio.Sound | null>(null);
  const tag_ref = useRef<SessionTag>('work');
  const start_time_ref = useRef<number | null>(null);

  useEffect(() => { phase_ref.current = phase; }, [phase]);
  useEffect(() => { start_time_ref.current = start_time; }, [start_time]);
  useEffect(() => { tag_ref.current = selected_tag; }, [selected_tag]);

  // -- Initialize: check for interrupted sessions + preload sound --
  useEffect(() => {
    const initialize = async () => {
      try {
        // Preload completion sound
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/completion.mp3'),
            { shouldPlay: false, volume: 0.7 }
          );
          completion_sound_ref.current = sound;
        } catch (e) {
          console.warn('Could not preload completion sound', e);
        }


        const [app_settings, active, history] = await Promise.all([
          get_settings(),
          get_active_session(),
          getSessions(),
        ]);
        set_settings(app_settings);
        set_sessions(history);
        await sync_pending_sessions();

        // Recover interrupted session → show summary
        if (active) {
          const now = Date.now();
          const elapsed = Math.floor((now - active.start_time) / 1000);
          set_summary_duration(elapsed);
          set_summary_start_time(active.start_time);
          set_phase('summary');
          await end_session(active.start_time, now, elapsed);
        }
      } catch (e) {
        console.error('Session manager init failed', e);
      }
    };
    initialize();

    return () => {
      // Cleanup sound on unmount
      if (completion_sound_ref.current) {
        completion_sound_ref.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // -- AppState listener: THE CORE MECHANIC --
  // Lock phone → active → inactive → background (session starts)
  // Unlock phone → background → inactive → active (session ends)
  useEffect(() => {
    const handle_app_state = async (next_state: AppStateStatus) => {
      console.log(`[FlipFocus] AppState: ${next_state}, phase: ${phase_ref.current}, start_time: ${start_time_ref.current}`);

      // --- GOING INACTIVE (phone locking / call incoming / etc.) ---
      // This is the RIGHT moment to start the session + Live Activity
      // because the app still has full foreground privileges here.
      if (next_state === 'inactive') {
        if (phase_ref.current === 'preparing') {
          const now = Date.now();

          // Update refs IMMEDIATELY (before any async work)
          // so the background fallback won't double-fire
          phase_ref.current = 'focusing';
          start_time_ref.current = now;

          set_start_time(now);
          set_phase('focusing');

          console.log('[FlipFocus] Session STARTED via inactive transition');

          // Start Live Activity IMMEDIATELY (fire and forget / independent promise)
          // to ensure it reaches native layer before suspension
          LiveActivityModule.startLiveActivity(now).catch((err: Error) =>
            console.log('[FlipFocus] Live Activity Error:', err)
          );

          await save_active_session({ start_time: now, started_via: 'lock' });
        }
      }

      // --- GOING TO BACKGROUND (phone is fully locked/away) ---
      // Safety fallback: if we missed the inactive transition
      if (next_state === 'background') {
        if (phase_ref.current === 'preparing') {
          const now = Date.now();

          // Update refs IMMEDIATELY
          phase_ref.current = 'focusing';
          start_time_ref.current = now;

          set_start_time(now);
          set_phase('focusing');

          console.log('[FlipFocus] Session STARTED via background fallback');

          LiveActivityModule.startLiveActivity(now).catch((err: Error) =>
            console.log('[FlipFocus] Live Activity Error (bg fallback):', err)
          );

          await save_active_session({ start_time: now, started_via: 'lock' });
        }
      }

      // --- COMING BACK TO FOREGROUND (user unlocked and opened app) ---
      if (next_state === 'active') {
        if (phase_ref.current === 'focusing' && start_time_ref.current) {
          const now = Date.now();
          const elapsed = Math.floor((now - start_time_ref.current) / 1000);

          console.log(`[FlipFocus] Session ENDED, elapsed: ${elapsed}s`);

          if (timer_ref.current) {
            clearInterval(timer_ref.current);
            timer_ref.current = null;
          }

          // Update ref IMMEDIATELY
          phase_ref.current = 'summary';

          set_summary_duration(elapsed);
          set_summary_start_time(start_time_ref.current);
          set_summary_tag(tag_ref.current);
          set_phase('summary');

          await end_session(start_time_ref.current, now, elapsed, tag_ref.current);
        }

        await sync_pending_sessions();
      }
    };

    const subscription = AppState.addEventListener('change', handle_app_state);
    return () => subscription.remove();
  }, []);

  // -- Deep Link Listener (Siri Shortcuts) --
  useEffect(() => {
    const handle_url = ({ url }: { url: string }) => {
      if (url?.includes('start-session')) {
        console.log('[FlipFocus] Deep link received: start-session');
        if (phase_ref.current === 'idle') {
           set_phase('preparing');
        }
      }
    };

    const sub = Linking.addEventListener('url', handle_url);

    Linking.getInitialURL().then((url) => {
      if (url?.includes('start-session')) {
        console.log('[FlipFocus] Initial URL: start-session');
        if (phase_ref.current === 'idle') {
           set_phase('preparing');
        }
      }
    });

    return () => sub.remove();
  }, []);

  // -- Timer display tick (only when focusing + app is foregrounded) --
  useEffect(() => {
    if (phase === 'focusing' && start_time) {
      // Immediately set the correct elapsed
      set_elapsed_seconds(Math.floor((Date.now() - start_time) / 1000));

      timer_ref.current = setInterval(() => {
        if (start_time) {
          set_elapsed_seconds(Math.floor((Date.now() - start_time) / 1000));
        }
      }, 1000);

      return () => {
        if (timer_ref.current) {
          clearInterval(timer_ref.current);
          timer_ref.current = null;
        }
      };
    }
  }, [phase, start_time]);

  // -- Flip detection during "preparing" phase --
  // Also enables proximity sensor so flipping auto-dims screen
  useEffect(() => {
    if (phase !== 'preparing') {
      // Disable proximity sensor when not preparing
      LiveActivityModule.disableProximitySensor().catch(() => {});
      return;
    }

    // Enable proximity sensor — turns off screen when phone is face-down
    LiveActivityModule.enableProximitySensor().catch(() => {});

    Accelerometer.setUpdateInterval(400);
    const sub = Accelerometer.addListener(({ z }) => {
      if (z > (settings.flip_sensitivity || 0.9)) {
        if (phase_ref.current !== 'preparing') return;
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const now = Date.now();
        set_start_time(now);
        start_time_ref.current = now;
        set_phase('focusing');

        save_active_session({ start_time: now, started_via: 'flip' });
        LiveActivityModule.startLiveActivity(now).catch((err: Error) =>
          console.log('Live Activity Error:', err)
        );
      }
    });

    return () => sub.remove();
  }, [phase, settings.flip_sensitivity]);

  // -- Disable proximity when session ends --
  useEffect(() => {
    if (phase === 'idle' || phase === 'summary') {
      LiveActivityModule.disableProximitySensor().catch(() => {});
    }
  }, [phase]);

  // --- Helper functions ---

  const play_completion_sound = async () => {
    try {
      if (completion_sound_ref.current) {
        await completion_sound_ref.current.setPositionAsync(0);
        await completion_sound_ref.current.playAsync();
      }
    } catch (e) {
      console.warn('Could not play completion sound', e);
    }
  };

  const end_session = async (session_start: number, session_end: number, duration: number, tag?: SessionTag) => {
    try {
      await clear_active_session();

      LiveActivityModule.stopLiveActivity().catch((err: Error) =>
        console.log('Stop Activity Error:', err)
      );
      LiveActivityModule.disableProximitySensor().catch(() => {});

      const current_settings = await get_settings();
      if (duration > current_settings.min_session_seconds) {
        // Play completion sound + heavy haptic
        play_completion_sound();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

        const new_session: FocusSession = {
          id: session_end.toString(),
          startTime: session_start,
          endTime: session_end,
          duration: duration,
          status: 'completed',
          tag: tag || tag_ref.current,
        };
        await saveSession(new_session);
        const updated = await getSessions();
        set_sessions(updated);
      }

      set_start_time(null);
      start_time_ref.current = null;
      set_elapsed_seconds(0);
    } catch (e) {
      console.error('Failed to end session', e);
    }
  };

  const sync_pending_sessions = async () => {
    try {
      const pending = await get_pending_completed();
      if (pending.length === 0) return;
      for (const p of pending) {
        const session: FocusSession = {
          id: p.end_time.toString(),
          startTime: p.start_time,
          endTime: p.end_time,
          duration: p.duration,
          status: 'completed',
        };
        await saveSession(session);
      }
      await clear_pending_completed();
      const updated = await getSessions();
      set_sessions(updated);
    } catch (e) {
      console.error('Failed to sync pending sessions', e);
    }
  };

  // --- Public actions ---

  const start_session = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    set_phase('preparing');
  }, []);

  const dismiss_summary = useCallback(() => {
    set_phase('idle');
    set_summary_duration(0);
    set_summary_start_time(0);
    set_summary_tag(undefined);
  }, []);

  const stop_session = useCallback(async () => {
    if (start_time_ref.current) {
      const now = Date.now();
      const elapsed = Math.floor((now - start_time_ref.current) / 1000);
      set_summary_duration(elapsed);
      set_summary_start_time(start_time_ref.current);
      set_summary_tag(tag_ref.current);
      set_phase('summary');
      await end_session(start_time_ref.current, now, elapsed, tag_ref.current);
    } else {
      set_phase('idle');
    }
    if (timer_ref.current) {
      clearInterval(timer_ref.current);
      timer_ref.current = null;
    }
  }, []);

  return {
    state: {
      phase,
      elapsed_seconds,
      start_time,
      summary_duration,
      summary_start_time,
      summary_tag,
      selected_tag,
      selected_sound,
    } as SessionState,
    actions: {
      start_session,
      dismiss_summary,
      stop_session,
      set_tag: set_selected_tag,
      set_sound: set_selected_sound,
    } as SessionActions,
    sessions,
    settings,
  };
};
