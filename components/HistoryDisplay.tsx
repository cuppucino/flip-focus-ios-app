import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FocusSession, SESSION_TAGS } from '../storage/sessionStorage';
import { format_duration, group_sessions_by_date } from '../utils/statsHelpers';
import { useTheme } from '../context/ThemeContext';

interface HistoryDisplayProps {
  sessions: FocusSession[];
  on_delete?: (id: string) => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ sessions, on_delete }) => {
  const { colors } = useTheme();
  const grouped = group_sessions_by_date(sessions);
  const sections = Array.from(grouped.entries()).map(([date, items]) => ({
    date,
    items,
  }));

  if (sessions.length === 0) {
    return (
      <View style={styles.empty_container}>
        <View style={[styles.empty_icon_bg, { backgroundColor: colors.divider }]}>
          <Ionicons name="time-outline" size={40} color={colors.text_tertiary} />
        </View>
        <Text style={[styles.empty_title, { color: colors.text_primary }]}>No sessions yet</Text>
        <Text style={[styles.empty_text, { color: colors.text_tertiary }]}>
          Flip your phone face-down to start a focus session
        </Text>
      </View>
    );
  }

  const get_time_of_day = (timestamp: number): string => {
    const hour = new Date(timestamp).getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const get_time_icon = (timestamp: number): keyof typeof Ionicons.glyphMap => {
    const period = get_time_of_day(timestamp);
    switch (period) {
      case 'morning': return 'sunny-outline';
      case 'afternoon': return 'partly-sunny-outline';
      case 'evening': return 'moon-outline';
      case 'night': return 'cloudy-night-outline';
      default: return 'time-outline';
    }
  };

  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <View key={section.date} style={styles.section}>
          <Text style={[styles.section_header, { color: colors.text_tertiary }]}>{section.date}</Text>
          {section.items.map((session) => (
            <View key={session.id} style={[styles.item, { backgroundColor: colors.bg_card, shadowColor: colors.shadow_color }]}>
              <View style={styles.item_left}>
                <View style={[styles.time_icon_bg, { backgroundColor: colors.accent_bg }]}>
                  <Ionicons
                    name={get_time_icon(session.startTime)}
                    size={16}
                    color={colors.accent}
                  />
                </View>
                <View>
                  {session.tag && (
                    <Text style={[styles.item_tag, { color: colors.accent }]}>
                      {SESSION_TAGS.find(t => t.key === session.tag)?.emoji}{' '}
                      {SESSION_TAGS.find(t => t.key === session.tag)?.label}
                    </Text>
                  )}
                  <Text style={[styles.item_time, { color: colors.text_primary }]}>
                    {new Date(session.startTime).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={[styles.item_period, { color: colors.text_tertiary }]}>
                    {get_time_of_day(session.startTime)}
                  </Text>
                </View>
              </View>
              <View style={styles.item_right}>
                <Text style={[styles.item_duration, { color: colors.accent }]}>{format_duration(session.duration)}</Text>
                {on_delete && (
                  <TouchableOpacity
                    onPress={() => on_delete(session.id)}
                    style={styles.delete_btn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  section: {
    marginBottom: 16,
  },
  section_header: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  item_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  time_icon_bg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item_time: {
    fontSize: 15,
    fontWeight: '600',
  },
  item_period: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
    textTransform: 'capitalize',
  },
  item_tag: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  item_right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  item_duration: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  delete_btn: {
    padding: 4,
  },
  empty_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  empty_icon_bg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  empty_title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  empty_text: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
  },
});
