import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionTag = 'work' | 'study' | 'reading' | 'creative' | 'exercise' | 'other';

export const SESSION_TAGS: { key: SessionTag; label: string; emoji: string; color: string }[] = [
  { key: 'work', label: 'Work', emoji: '💼', color: '#6366F1' },
  { key: 'study', label: 'Study', emoji: '📚', color: '#3B82F6' },
  { key: 'reading', label: 'Reading', emoji: '📖', color: '#10B981' },
  { key: 'creative', label: 'Creative', emoji: '🎨', color: '#F59E0B' },
  { key: 'exercise', label: 'Exercise', emoji: '🏃', color: '#EF4444' },
  { key: 'other', label: 'Other', emoji: '✨', color: '#8B5CF6' },
];

export interface FocusSession {
  id: string;
  startTime: number; // timestamp
  endTime: number;   // timestamp
  duration: number;  // seconds
  status: 'completed' | 'interrupted';
  tag?: SessionTag;  // optional for backward compatibility
}

const STORAGE_KEY = '@flip_focus_sessions';

export const saveSession = async (session: FocusSession): Promise<void> => {
  try {
    const existingSessions = await getSessions();
    const updatedSessions = [session, ...existingSessions];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

export const getSessions = async (): Promise<FocusSession[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to prevent sessions', e);
    return [];
  }
};

export const deleteSession = async (id: string): Promise<void> => {
  try {
    const sessions = await getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete session', e);
  }
};

export const clearHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch(e) {
        console.error('Failed to clear sessions', e);
    }
}
