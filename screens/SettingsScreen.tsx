import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { get_settings, save_settings, AppSettings, DEFAULT_SETTINGS, ThemeMode } from '../storage/settingsStorage';
import { clearHistory } from '../storage/sessionStorage';
import { useTheme } from '../context/ThemeContext';
import { schedule_daily_reminder, cancel_reminder } from '../utils/notificationHelper';

export const SettingsScreen = () => {
  const { colors, set_theme_mode } = useTheme();
  const [settings, set_settings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [goal_input, set_goal_input] = useState('');
  const [reminder_hour_input, set_reminder_hour_input] = useState('');

  useFocusEffect(
    useCallback(() => {
      load_settings();
    }, [])
  );

  const load_settings = async () => {
    try {
      const s = await get_settings();
      set_settings(s);
      set_goal_input(s.daily_goal_minutes.toString());
      set_reminder_hour_input(s.reminder_hour.toString());
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const update_setting = async (key: keyof AppSettings, value: any) => {
    try {
      const updated = { ...settings, [key]: value };
      set_settings(updated);
      await save_settings({ [key]: value });

      // Sync theme mode with ThemeContext
      if (key === 'theme_mode') {
        set_theme_mode(value as ThemeMode);
      }

      // Handle reminder scheduling
      if (key === 'reminder_enabled') {
        if (value) {
          await schedule_daily_reminder(updated.reminder_hour);
        } else {
          await cancel_reminder();
        }
      }
    } catch (e) {
      console.error('Failed to save setting', e);
    }
  };

  const handle_goal_submit = () => {
    const parsed = parseInt(goal_input, 10);
    if (!isNaN(parsed) && parsed > 0) {
      update_setting('daily_goal_minutes', parsed);
    } else {
      set_goal_input(settings.daily_goal_minutes.toString());
    }
  };

  const handle_reminder_hour_submit = async () => {
    const parsed = parseInt(reminder_hour_input, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) {
      await update_setting('reminder_hour', parsed);
      if (settings.reminder_enabled) {
        await schedule_daily_reminder(parsed);
      }
    } else {
      set_reminder_hour_input(settings.reminder_hour.toString());
    }
  };

  const handle_clear_history = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all your focus sessions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              Alert.alert('Done', 'All sessions have been cleared.');
            } catch (e) {
              console.error('Failed to clear history', e);
            }
          },
        },
      ]
    );
  };

  const sensitivity_labels: Record<number, string> = {
    0.7: 'Very Low',
    0.8: 'Low',
    0.85: 'Medium',
    0.9: 'High (Default)',
    0.95: 'Very High',
  };

  const sensitivity_options = [0.7, 0.8, 0.85, 0.9, 0.95];

  const format_hour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display}:00 ${period}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg_primary }]}>
      <ScrollView contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: colors.text_primary }]}>Settings</Text>

        {/* Focus Goal Section */}
        <View style={styles.section}>
          <Text style={[styles.section_title, { color: colors.text_tertiary }]}>Focus Goal</Text>
          <View style={[styles.card, { backgroundColor: colors.bg_card, shadowColor: colors.shadow_color }]}>
            <View style={styles.row}>
              <View style={styles.row_left}>
                <Ionicons name="flag-outline" size={20} color={colors.accent} />
                <Text style={[styles.row_label, { color: colors.text_primary }]}>Daily Goal (minutes)</Text>
              </View>
              <TextInput
                style={[styles.goal_input, { borderColor: colors.border, color: colors.accent, backgroundColor: colors.bg_input }]}
                value={goal_input}
                onChangeText={set_goal_input}
                onBlur={handle_goal_submit}
                onSubmitEditing={handle_goal_submit}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={4}
              />
            </View>
          </View>
        </View>

        {/* Detection Section */}
        <View style={styles.section}>
          <Text style={[styles.section_title, { color: colors.text_tertiary }]}>Flip Detection</Text>
          <View style={[styles.card, { backgroundColor: colors.bg_card, shadowColor: colors.shadow_color }]}>
            <Text style={[styles.sensitivity_label, { color: colors.text_primary }]}>Sensitivity</Text>
            <Text style={[styles.sensitivity_desc, { color: colors.text_tertiary }]}>
              Higher sensitivity requires a more precise face-down angle to trigger
            </Text>
            <View style={styles.sensitivity_options}>
              {sensitivity_options.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.sensitivity_chip,
                    { backgroundColor: colors.divider },
                    settings.flip_sensitivity === val && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => update_setting('flip_sensitivity', val)}
                >
                  <Text
                    style={[
                      styles.sensitivity_chip_text,
                      { color: colors.text_secondary },
                      settings.flip_sensitivity === val && { color: '#FFFFFF' },
                    ]}
                  >
                    {sensitivity_labels[val]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.row, { marginTop: 16 }]}>
              <View style={styles.row_left}>
                <Ionicons name="timer-outline" size={20} color={colors.accent} />
                <View>
                  <Text style={[styles.row_label, { color: colors.text_primary }]}>Min Session Duration</Text>
                  <Text style={[styles.row_desc, { color: colors.text_tertiary }]}>{settings.min_session_seconds}s to save</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.section_title, { color: colors.text_tertiary }]}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: colors.bg_card, shadowColor: colors.shadow_color }]}>
            {/* Theme Mode */}
            <View style={styles.row}>
              <View style={styles.row_left}>
                <Ionicons name="color-palette-outline" size={20} color={colors.accent} />
                <Text style={[styles.row_label, { color: colors.text_primary }]}>Appearance</Text>
              </View>
            </View>
            <View style={[styles.theme_selector, { backgroundColor: colors.divider }]}>
              {(['light', 'system', 'dark'] as ThemeMode[]).map((mode) => {
                const is_selected = settings.theme_mode === mode;
                const icons: Record<ThemeMode, keyof typeof Ionicons.glyphMap> = {
                  light: 'sunny-outline',
                  system: 'phone-portrait-outline',
                  dark: 'moon-outline',
                };
                const labels: Record<ThemeMode, string> = {
                  light: 'Light',
                  system: 'System',
                  dark: 'Dark',
                };
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.theme_option,
                      is_selected && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => update_setting('theme_mode', mode)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={icons[mode]}
                      size={16}
                      color={is_selected ? '#FFFFFF' : colors.text_secondary}
                    />
                    <Text
                      style={[
                        styles.theme_option_text,
                        { color: is_selected ? '#FFFFFF' : colors.text_secondary },
                      ]}
                    >
                      {labels[mode]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Haptic Feedback */}
            <View style={styles.row}>
              <View style={styles.row_left}>
                <Ionicons name="hand-left-outline" size={20} color={colors.accent} />
                <Text style={[styles.row_label, { color: colors.text_primary }]}>Haptic Feedback</Text>
              </View>
              <Switch
                value={settings.haptics_enabled}
                onValueChange={(v) => update_setting('haptics_enabled', v)}
                trackColor={{ false: colors.switch_track_off, true: colors.switch_track_on }}
                thumbColor={settings.haptics_enabled ? colors.accent : colors.switch_thumb_off}
              />
            </View>
          </View>
        </View>

        {/* Notification Reminder Section */}
        <View style={styles.section}>
          <Text style={[styles.section_title, { color: colors.text_tertiary }]}>Reminders</Text>
          <View style={[styles.card, { backgroundColor: colors.bg_card, shadowColor: colors.shadow_color }]}>
            <View style={styles.row}>
              <View style={styles.row_left}>
                <Ionicons name="notifications-outline" size={20} color={colors.accent} />
                <View>
                  <Text style={[styles.row_label, { color: colors.text_primary }]}>Daily Reminder</Text>
                  <Text style={[styles.row_desc, { color: colors.text_tertiary }]}>
                    Remind me to focus
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.reminder_enabled}
                onValueChange={(v) => update_setting('reminder_enabled', v)}
                trackColor={{ false: colors.switch_track_off, true: colors.switch_track_on }}
                thumbColor={settings.reminder_enabled ? colors.accent : colors.switch_thumb_off}
              />
            </View>

            {settings.reminder_enabled && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <View style={styles.row}>
                  <View style={styles.row_left}>
                    <Ionicons name="time-outline" size={20} color={colors.accent} />
                    <View>
                      <Text style={[styles.row_label, { color: colors.text_primary }]}>Reminder Time</Text>
                      <Text style={[styles.row_desc, { color: colors.text_tertiary }]}>
                        {format_hour(settings.reminder_hour)}
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.goal_input, { borderColor: colors.border, color: colors.accent, backgroundColor: colors.bg_input }]}
                    value={reminder_hour_input}
                    onChangeText={set_reminder_hour_input}
                    onBlur={handle_reminder_hour_submit}
                    onSubmitEditing={handle_reminder_hour_submit}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    maxLength={2}
                    placeholder="20"
                    placeholderTextColor={colors.text_tertiary}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.section_title, { color: colors.text_tertiary }]}>Data</Text>
          <TouchableOpacity
            style={[styles.danger_button, { backgroundColor: colors.danger_bg, borderColor: colors.danger_border }]}
            onPress={handle_clear_history}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.danger_text, { color: colors.danger }]}>Clear All Session History</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.about}>
          <Text style={[styles.about_name, { color: colors.accent }]}>Flip Focus</Text>
          <Text style={[styles.about_version, { color: colors.text_tertiary }]}>Version 1.0.0</Text>
          <Text style={[styles.about_desc, { color: colors.text_secondary }]}>
            Put your phone down. Pick up your focus.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll_content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  section_title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  row_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  row_label: {
    fontSize: 15,
    fontWeight: '600',
  },
  row_desc: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  goal_input: {
    width: 70,
    height: 38,
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  sensitivity_label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  sensitivity_desc: {
    fontSize: 12,
    marginBottom: 12,
  },
  sensitivity_options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sensitivity_chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sensitivity_chip_text: {
    fontSize: 13,
    fontWeight: '600',
  },
  danger_button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  danger_text: {
    fontSize: 15,
    fontWeight: '600',
  },
  about: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  about_name: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  about_version: {
    fontSize: 13,
    marginBottom: 8,
  },
  about_desc: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  theme_selector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginTop: 10,
  },
  theme_option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  theme_option_text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
