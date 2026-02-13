import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DailyFocus } from '../utils/statsHelpers';
import { useTheme } from '../context/ThemeContext';

interface WeeklyChartProps {
  data: DailyFocus[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const { colors, is_dark } = useTheme();
  const max_minutes = Math.max(...data.map((d) => d.minutes), 1);

  const today_str = new Date().toDateString();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg_card, shadowColor: colors.accent }]}>
      <Text style={[styles.title, { color: colors.text_primary }]}>This Week</Text>
      <View style={styles.chart}>
        {data.map((day, index) => {
          const height_pct = (day.minutes / max_minutes) * 100;
          const is_today = day.date === today_str;

          return (
            <View key={index} style={styles.bar_wrapper}>
              <Text style={[styles.bar_value, { color: colors.text_tertiary }]}>
                {day.minutes > 0 ? `${day.minutes}m` : ''}
              </Text>
              <View style={[styles.bar_track, { backgroundColor: colors.chart_bar_bg }]}>
                <View
                  style={[
                    styles.bar_fill,
                    {
                      height: `${Math.max(height_pct, 3)}%`,
                      backgroundColor: is_today ? colors.accent : (is_dark ? '#4A4578' : '#DDD6FE'),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.bar_label, { color: colors.text_tertiary }, is_today && { color: colors.accent, fontWeight: '700' }]}>
                {day.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  bar_wrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar_value: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bar_track: {
    width: 24,
    height: '70%',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar_fill: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },
  bar_label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
});
