import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { get_settings, ThemeMode } from '../storage/settingsStorage';

export interface ThemeColors {
  // Backgrounds
  bg_primary: string;
  bg_secondary: string;
  bg_card: string;
  bg_input: string;

  // Text
  text_primary: string;
  text_secondary: string;
  text_tertiary: string;

  // Accent
  accent: string;
  accent_light: string;
  accent_bg: string;

  // Semantic
  success: string;
  warning: string;
  danger: string;
  danger_bg: string;
  danger_border: string;

  // Borders / Dividers
  border: string;
  divider: string;

  // Tab bar
  tab_bg: string;
  tab_shadow: string;

  // Shadows
  shadow_color: string;

  // Switch
  switch_track_off: string;
  switch_track_on: string;
  switch_thumb_off: string;

  // Chart bar
  chart_bar_bg: string;

  // Goal bar
  goal_bar_bg: string;
}

const LIGHT_THEME: ThemeColors = {
  bg_primary: '#F8F9FC',
  bg_secondary: '#FFFFFF',
  bg_card: '#FFFFFF',
  bg_input: '#FFFFFF',

  text_primary: '#1a1a2e',
  text_secondary: '#6B7280',
  text_tertiary: '#9CA3AF',

  accent: '#6C63FF',
  accent_light: '#C4B5FD',
  accent_bg: 'rgba(108, 99, 255, 0.06)',

  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  danger_bg: '#FEF2F2',
  danger_border: '#FECACA',

  border: '#E5E7EB',
  divider: '#F3F4F6',

  tab_bg: '#FFFFFF',
  tab_shadow: '#000',

  shadow_color: '#000',

  switch_track_off: '#E5E7EB',
  switch_track_on: '#C4B5FD',
  switch_thumb_off: '#f4f3f4',

  chart_bar_bg: '#F3F4F6',
  goal_bar_bg: '#F3F4F6',
};

const DARK_THEME: ThemeColors = {
  bg_primary: '#0F0F1A',
  bg_secondary: '#1A1A2E',
  bg_card: '#1E1E36',
  bg_input: '#2A2A44',

  text_primary: '#F0F0F5',
  text_secondary: '#A0A0B8',
  text_tertiary: '#6B6B80',

  accent: '#8B7FFF',
  accent_light: '#C4B5FD',
  accent_bg: 'rgba(139, 127, 255, 0.12)',

  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  danger_bg: 'rgba(248, 113, 113, 0.1)',
  danger_border: 'rgba(248, 113, 113, 0.3)',

  border: '#2E2E48',
  divider: '#252540',

  tab_bg: '#16162A',
  tab_shadow: '#000',

  shadow_color: '#000',

  switch_track_off: '#2E2E48',
  switch_track_on: '#6C63FF',
  switch_thumb_off: '#555',

  chart_bar_bg: '#252540',
  goal_bar_bg: '#252540',
};

interface ThemeContextValue {
  colors: ThemeColors;
  is_dark: boolean;
  theme_mode: ThemeMode;
  set_theme_mode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: LIGHT_THEME,
  is_dark: false,
  theme_mode: 'system',
  set_theme_mode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const system_scheme = useColorScheme(); // 'light' | 'dark' | null
  const [theme_mode, set_theme_mode_state] = useState<ThemeMode>('system');

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await get_settings();
        set_theme_mode_state(settings.theme_mode);
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    load();
  }, []);

  const set_theme_mode = (mode: ThemeMode) => set_theme_mode_state(mode);

  // Resolve effective dark/light
  const is_dark = theme_mode === 'system'
    ? system_scheme === 'dark'
    : theme_mode === 'dark';

  const value = useMemo<ThemeContextValue>(() => ({
    colors: is_dark ? DARK_THEME : LIGHT_THEME,
    is_dark,
    theme_mode,
    set_theme_mode,
  }), [is_dark, theme_mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
