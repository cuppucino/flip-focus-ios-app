import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Text, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSessions, FocusSession, deleteSession } from '../storage/sessionStorage';
import { get_settings, DEFAULT_SETTINGS } from '../storage/settingsStorage';
import {
  get_today_sessions,
  get_total_seconds,
  get_longest_session,
  get_streak,
  get_weekly_data,
  format_duration,
} from '../utils/statsHelpers';
import { StatsCard } from '../components/StatsCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { StreakBadge } from '../components/StreakBadge';
import { HistoryDisplay } from '../components/HistoryDisplay';
import { useTheme } from '../context/ThemeContext';

export const StatsScreen = () => {
  const { colors } = useTheme();
  const [sessions, set_sessions] = useState<FocusSession[]>([]);
  const [refreshing, set_refreshing] = useState(false);
  const [daily_goal, set_daily_goal] = useState(DEFAULT_SETTINGS.daily_goal_minutes);

  const load_data = async () => {
    try {
      const [history, settings] = await Promise.all([getSessions(), get_settings()]);
      set_sessions(history);
      set_daily_goal(settings.daily_goal_minutes);
    } catch (e) {
      console.error('Failed to load stats data', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load_data();
    }, [])
  );

  const on_refresh = async () => {
    set_refreshing(true);
    await load_data();
    set_refreshing(false);
  };

  const handle_delete = async (id: string) => {
    try {
      await deleteSession(id);
      await load_data();
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  };

  const today_sessions = get_today_sessions(sessions);
  const today_total = get_total_seconds(today_sessions);
  const longest = get_longest_session(today_sessions);
  const streak = get_streak(sessions);
  const weekly_data = get_weekly_data(sessions);

  const goal_pct = daily_goal > 0
    ? Math.min(Math.round((today_total / (daily_goal * 60)) * 100), 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg_primary }]}>
      <ScrollView
        contentContainerStyle={styles.scroll_content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={on_refresh} tintColor={colors.accent} />
        }
      >
        <Text style={[styles.header, { color: colors.text_primary }]}>Dashboard</Text>

        <StreakBadge streak={streak} />

        <View style={styles.stats_row}>
          <StatsCard
            icon="time-outline"
            label="Today"
            value={format_duration(today_total)}
            accent_color={colors.accent}
          />
          <View style={{ width: 10 }} />
          <StatsCard
            icon="trophy-outline"
            label="Longest"
            value={format_duration(longest)}
            accent_color={colors.warning}
          />
          <View style={{ width: 10 }} />
          <StatsCard
            icon="checkmark-circle-outline"
            label="Sessions"
            value={`${today_sessions.length}`}
            accent_color={colors.success}
          />
        </View>

        {daily_goal > 0 && (
          <View style={[styles.goal_card, { backgroundColor: colors.bg_card, shadowColor: colors.accent }]}>
            <View style={styles.goal_header}>
              <Text style={[styles.goal_title, { color: colors.text_primary }]}>Daily Goal</Text>
              <Text style={[styles.goal_pct, { color: colors.accent }]}>{goal_pct}%</Text>
            </View>
            <View style={[styles.goal_bar_bg, { backgroundColor: colors.goal_bar_bg }]}>
              <View
                style={[
                  styles.goal_bar_fill,
                  {
                    width: `${goal_pct}%`,
                    backgroundColor: goal_pct >= 100 ? colors.success : colors.accent,
                  },
                ]}
              />
            </View>
            <Text style={[styles.goal_subtitle, { color: colors.text_tertiary }]}>
              {format_duration(today_total)} / {format_duration(daily_goal * 60)}
              {goal_pct >= 100 ? ' — Goal reached! 🎉' : ''}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <WeeklyChart data={weekly_data} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.section_title, { color: colors.text_primary }]}>Session History</Text>
          <HistoryDisplay sessions={sessions} on_delete={handle_delete} />
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
    marginBottom: 20,
  },
  stats_row: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  goal_card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  goal_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goal_title: {
    fontSize: 15,
    fontWeight: '700',
  },
  goal_pct: {
    fontSize: 15,
    fontWeight: '700',
  },
  goal_bar_bg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goal_bar_fill: {
    height: '100%',
    borderRadius: 4,
  },
  goal_subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  section_title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
});
