import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  daily_goal_minutes: number;      // daily focus goal in minutes
  min_session_seconds: number;     // minimum session duration to save
  haptics_enabled: boolean;
  theme_mode: ThemeMode;
  flip_sensitivity: number;        // 0.7 - 0.95 threshold for z-axis
  has_seen_onboarding: boolean;
  reminder_enabled: boolean;
  reminder_hour: number;           // 0-23, hour of day for daily reminder
}

const SETTINGS_KEY = '@flip_focus_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  daily_goal_minutes: 120,
  min_session_seconds: 5,
  haptics_enabled: true,
  theme_mode: 'system',
  flip_sensitivity: 0.9,
  has_seen_onboarding: false,
  reminder_enabled: false,
  reminder_hour: 20,
};

export const get_settings = async (): Promise<AppSettings> => {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
    return DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
};

export const save_settings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const current = await get_settings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};
