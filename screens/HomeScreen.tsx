import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSessionManager } from '../hooks/useSessionManager';
import { TimerDisplay } from '../components/TimerDisplay';
import { SessionSummary } from '../components/SessionSummary';
import { SoundPlayer } from '../components/SoundPlayer';
import { get_today_sessions, get_total_seconds } from '../utils/statsHelpers';
import { SESSION_TAGS } from '../storage/sessionStorage';
import { useTheme } from '../context/ThemeContext';

export const HomeScreen = () => {
  const { state, actions, sessions, settings } = useSessionManager();
  const { colors, is_dark: theme_is_dark } = useTheme();
  const {
    phase,
    elapsed_seconds,
    summary_duration,
    summary_start_time,
    summary_tag,
    selected_tag,
    selected_sound,
  } = state;

  // Background color animation
  const bg_anim = useRef(new Animated.Value(0)).current;
  // Preparing prompt animation
  const prompt_anim = useRef(new Animated.Value(0)).current;
  // Pulse animation for preparing state
  const pulse_anim = useRef(new Animated.Value(1)).current;

  const is_session_dark = phase === 'focusing' || phase === 'preparing';

  useEffect(() => {
    Animated.timing(bg_anim, {
      toValue: is_session_dark ? 1 : 0,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [is_session_dark]);

  // Animate the "put phone away" prompt
  useEffect(() => {
    if (phase === 'preparing') {
      Animated.spring(prompt_anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse_anim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse_anim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      return () => {
        loop.stop();
        prompt_anim.setValue(0);
        pulse_anim.setValue(1);
      };
    }
  }, [phase]);

  const today_sessions = get_today_sessions(sessions);
  const today_total = get_total_seconds(today_sessions);

  const bg_color = bg_anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bg_primary, '#0F0F1A'],
  });

  // Get tag info for summary
  const tag_info = summary_tag
    ? SESSION_TAGS.find(t => t.key === summary_tag)
    : undefined;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg_color }]}>
      <SafeAreaView style={styles.safe_area}>

        {/* ===== IDLE STATE: Show start button ===== */}
        {phase === 'idle' && (
          <>
            <View style={styles.idle_top}>
              <Text style={[styles.idle_greeting, { color: colors.text_primary }]}>Ready to focus?</Text>
              <Text style={[styles.idle_subtitle, { color: colors.text_tertiary }]}>
                Start a session, then lock your phone{' '}
                or flip it face-down.{'\n'}
                Timer stops when you unlock.
              </Text>
            </View>

            <View style={styles.center_section}>
              <TimerDisplay
                seconds={0}
                is_active={false}
                daily_goal_minutes={settings.daily_goal_minutes}
                today_total_seconds={today_total}
              />
            </View>

            <View style={styles.bottom_section}>
              <TouchableOpacity
                style={[styles.start_button, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
                onPress={actions.start_session}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={22} color="#FFFFFF" />
                <Text style={styles.start_text}>Start Focus</Text>
              </TouchableOpacity>

              <View style={styles.hint_row}>
                <Ionicons name="information-circle-outline" size={14} color={colors.text_tertiary} />
                <Text style={[styles.hint_text, { color: colors.text_tertiary }]}>
                  Lock or flip your phone to start. Unlocking ends it.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ===== PREPARING STATE: Tag + Sound selector + "Put phone away" ===== */}
        {phase === 'preparing' && (
          <View style={styles.preparing_container}>
            <Animated.View
              style={[
                styles.preparing_content,
                {
                  opacity: prompt_anim,
                  transform: [
                    { scale: pulse_anim },
                    { translateY: prompt_anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    })},
                  ],
                },
              ]}
            >
              {/* Phone flip icon */}
              <View style={styles.flip_icon_container}>
                <Ionicons name="phone-portrait-outline" size={48} color="#A78BFA" />
                <View style={styles.flip_arrow}>
                  <Ionicons name="arrow-down" size={24} color="#6C63FF" />
                </View>
              </View>

              <Text style={styles.preparing_title}>Put your phone down</Text>
              <Text style={styles.preparing_subtitle}>
                Lock the screen or flip it face-down.{'\n'}
                Stay away from your phone.
              </Text>

              <Text style={styles.preparing_detail}>
                Timer starts when you lock or flip.
              </Text>

              {/* Cancel button */}
              <TouchableOpacity
                style={styles.cancel_button}
                onPress={() => actions.stop_session()}
              >
                <Text style={styles.cancel_text}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* ===== FOCUSING STATE: Active timer (shown when app is open during session) ===== */}
        {phase === 'focusing' && (
          <>
            <View style={styles.center_section}>
              <TimerDisplay
                seconds={elapsed_seconds}
                is_active={true}
                daily_goal_minutes={settings.daily_goal_minutes}
                today_total_seconds={today_total}
              />
            </View>

            <View style={styles.bottom_section}>
              <View style={styles.active_indicator}>
                <View style={styles.pulse_dot} />
                <Text style={styles.active_label}>
                  {SESSION_TAGS.find(t => t.key === selected_tag)?.emoji}{' '}
                  Session in progress
                </Text>
              </View>

              <Text style={styles.focusing_hint}>
                Put your phone down and stay focused.{'\n'}
                Timer runs until you unlock.
              </Text>

              {/* Stop button */}
              <TouchableOpacity
                style={styles.stop_button}
                onPress={actions.stop_session}
              >
                <Ionicons name="stop-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.stop_text}>End Session</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ===== SUMMARY STATE: Session complete overlay ===== */}
        {phase === 'summary' && summary_duration > 0 && (
          <SessionSummary
            duration={summary_duration}
            start_time={summary_start_time}
            tag={tag_info ? { emoji: tag_info.emoji, label: tag_info.label } : undefined}
            on_dismiss={actions.dismiss_summary}
          />
        )}

      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe_area: {
    flex: 1,
  },

  // Idle
  idle_top: {
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  idle_greeting: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  idle_subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  center_section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom_section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  start_button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    width: '100%',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  start_text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hint_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  hint_text: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Preparing
  preparing_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  preparing_content: {
    alignItems: 'center',
    width: '100%',
  },
  flip_icon_container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  flip_arrow: {
    marginTop: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preparing_title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  preparing_subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  selector_section: {
    width: '100%',
    marginBottom: 4,
  },
  preparing_detail: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 24,
  },
  cancel_button: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cancel_text: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },

  // Focusing
  active_indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pulse_dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  active_label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
  },
  focusing_hint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  stop_button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
  },
  stop_text: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
});
