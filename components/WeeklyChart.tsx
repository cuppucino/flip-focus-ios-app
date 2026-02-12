import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DailyFocus } from '../utils/statsHelpers';

interface WeeklyChartProps {
  data: DailyFocus[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const max_minutes = Math.max(...data.map((d) => d.minutes), 1); // avoid division by zero

  const today_str = new Date().toDateString();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week</Text>
      <View style={styles.chart}>
        {data.map((day, index) => {
          const height_pct = (day.minutes / max_minutes) * 100;
          const is_today = day.date === today_str;

          return (
            <View key={index} style={styles.bar_wrapper}>
              <Text style={styles.bar_value}>
                {day.minutes > 0 ? `${day.minutes}m` : ''}
              </Text>
              <View style={styles.bar_track}>
                <View
                  style={[
                    styles.bar_fill,
                    {
                      height: `${Math.max(height_pct, 3)}%`,
                      backgroundColor: is_today ? '#6C63FF' : '#DDD6FE',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.bar_label, is_today && styles.bar_label_active]}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
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
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bar_track: {
    width: 24,
    height: '70%',
    backgroundColor: '#F3F4F6',
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
    color: '#9CA3AF',
    fontWeight: '600',
  },
  bar_label_active: {
    color: '#6C63FF',
    fontWeight: '700',
  },
});
