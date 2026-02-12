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
import { get_settings, save_settings, AppSettings, DEFAULT_SETTINGS } from '../storage/settingsStorage';
import { clearHistory } from '../storage/sessionStorage';

export const SettingsScreen = () => {
  const [settings, set_settings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [goal_input, set_goal_input] = useState('');

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
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const update_setting = async (key: keyof AppSettings, value: any) => {
    try {
      const updated = { ...settings, [key]: value };
      set_settings(updated);
      await save_settings({ [key]: value });
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Settings</Text>

        {/* Focus Goal Section */}
        <View style={styles.section}>
          <Text style={styles.section_title}>Focus Goal</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.row_left}>
                <Ionicons name="flag-outline" size={20} color="#6C63FF" />
                <Text style={styles.row_label}>Daily Goal (minutes)</Text>
              </View>
              <TextInput
                style={styles.goal_input}
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
          <Text style={styles.section_title}>Flip Detection</Text>
          <View style={styles.card}>
            <Text style={styles.sensitivity_label}>Sensitivity</Text>
            <Text style={styles.sensitivity_desc}>
              Higher sensitivity requires a more precise face-down angle to trigger
            </Text>
            <View style={styles.sensitivity_options}>
              {sensitivity_options.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.sensitivity_chip,
                    settings.flip_sensitivity === val && styles.sensitivity_chip_active,
                  ]}
                  onPress={() => update_setting('flip_sensitivity', val)}
                >
                  <Text
                    style={[
                      styles.sensitivity_chip_text,
                      settings.flip_sensitivity === val && styles.sensitivity_chip_text_active,
                    ]}
                  >
                    {sensitivity_labels[val]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.row, { marginTop: 16 }]}>
              <View style={styles.row_left}>
                <Ionicons name="timer-outline" size={20} color="#6C63FF" />
                <View>
                  <Text style={styles.row_label}>Min Session Duration</Text>
                  <Text style={styles.row_desc}>{settings.min_session_seconds}s to save</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.section_title}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.row_left}>
                <Ionicons name="hand-left-outline" size={20} color="#6C63FF" />
                <Text style={styles.row_label}>Haptic Feedback</Text>
              </View>
              <Switch
                value={settings.haptics_enabled}
                onValueChange={(v) => update_setting('haptics_enabled', v)}
                trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                thumbColor={settings.haptics_enabled ? '#6C63FF' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.section_title}>Data</Text>
          <TouchableOpacity style={styles.danger_button} onPress={handle_clear_history}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.danger_text}>Clear All Session History</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.about}>
          <Text style={styles.about_name}>Flip Focus</Text>
          <Text style={styles.about_version}>Version 1.0.0</Text>
          <Text style={styles.about_desc}>
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
    backgroundColor: '#F8F9FC',
  },
  scroll_content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  section_title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
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
    color: '#1a1a2e',
  },
  row_desc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  goal_input: {
    width: 70,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
  sensitivity_label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  sensitivity_desc: {
    fontSize: 12,
    color: '#9CA3AF',
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
    backgroundColor: '#F3F4F6',
  },
  sensitivity_chip_active: {
    backgroundColor: '#6C63FF',
  },
  sensitivity_chip_text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  sensitivity_chip_text_active: {
    color: '#FFFFFF',
  },
  danger_button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  danger_text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  about: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  about_name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 4,
  },
  about_version: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  about_desc: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
