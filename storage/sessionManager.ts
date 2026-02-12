import AsyncStorage from '@react-native-async-storage/async-storage';

// Persists the "currently active session" so it survives app backgrounding and kills.
// This is the source of truth for whether a focus session is running.

const ACTIVE_SESSION_KEY = '@flip_focus_active_session';
const PENDING_COMPLETED_KEY = '@flip_focus_pending_completed';

export interface ActiveSession {
  start_time: number;     // timestamp when session began
  started_via: 'flip' | 'manual' | 'lock';  // how session was initiated
}

export interface PendingCompleted {
  start_time: number;
  end_time: number;
  duration: number;
}

// Save that a session is now active
export const save_active_session = async (session: ActiveSession): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save active session', e);
  }
};

// Get the currently active session (if any)
export const get_active_session = async (): Promise<ActiveSession | null> => {
  try {
    const json = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Failed to get active session', e);
    return null;
  }
};

// Clear active session (when session ends)
export const clear_active_session = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear active session', e);
  }
};

// Save a session that was completed natively (e.g. via Live Activity stop button)
// These get synced into the main session list on next app foreground
export const save_pending_completed = async (session: PendingCompleted): Promise<void> => {
  try {
    const existing = await get_pending_completed();
    await AsyncStorage.setItem(PENDING_COMPLETED_KEY, JSON.stringify([...existing, session]));
  } catch (e) {
    console.error('Failed to save pending completed', e);
  }
};

export const get_pending_completed = async (): Promise<PendingCompleted[]> => {
  try {
    const json = await AsyncStorage.getItem(PENDING_COMPLETED_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to get pending completed', e);
    return [];
  }
};

export const clear_pending_completed = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PENDING_COMPLETED_KEY);
  } catch (e) {
    console.error('Failed to clear pending completed', e);
  }
};
