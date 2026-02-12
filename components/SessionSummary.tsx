import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format_duration } from '../utils/statsHelpers';

interface SessionSummaryProps {
  duration: number;        // seconds
  start_time: number;      // timestamp
  tag?: { emoji: string; label: string };
  on_dismiss: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  duration,
  start_time,
  tag,
  on_dismiss,
}) => {
  const get_rating = (seconds: number): { emoji: string; title: string; message: string } => {
    const minutes = seconds / 60;
    if (minutes >= 90) return { emoji: '🏆', title: 'Legendary Session!', message: 'Over 90 minutes of pure focus. Incredible discipline.' };
    if (minutes >= 60) return { emoji: '🔥', title: 'Outstanding!', message: 'A full hour of deep work. You crushed it.' };
    if (minutes >= 45) return { emoji: '💪', title: 'Impressive!', message: '45+ minutes of solid concentration.' };
    if (minutes >= 25) return { emoji: '🎯', title: 'Great Session!', message: 'A perfect Pomodoro-length focus block.' };
    if (minutes >= 10) return { emoji: '⚡', title: 'Good Start!', message: 'Every focused minute counts.' };
    if (minutes >= 1) return { emoji: '🌱', title: 'Quick Focus', message: 'Keep building the habit!' };
    return { emoji: '💫', title: 'Session Complete', message: 'Try going longer next time!' };
  };

  const rating = get_rating(duration);
  const time_str = new Date(start_time).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Big Emoji */}
        <Text style={styles.emoji}>{rating.emoji}</Text>

        {/* Title */}
        <Text style={styles.title}>{rating.title}</Text>

        {/* Duration */}
        <View style={styles.duration_container}>
          <Text style={styles.duration_value}>{format_duration(duration)}</Text>
          <Text style={styles.duration_label}>of deep focus</Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          {tag && (
            <View style={styles.detail_row}>
              <Text style={{ fontSize: 16 }}>{tag.emoji}</Text>
              <Text style={styles.detail_text}>{tag.label}</Text>
            </View>
          )}
          <View style={styles.detail_row}>
            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
            <Text style={styles.detail_text}>Started at {time_str}</Text>
          </View>
          <View style={styles.detail_row}>
            <Ionicons name="hourglass-outline" size={16} color="#9CA3AF" />
            <Text style={styles.detail_text}>{Math.floor(duration / 60)} min {duration % 60} sec</Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.message}>{rating.message}</Text>

        {/* Dismiss */}
        <TouchableOpacity style={styles.dismiss_button} onPress={on_dismiss}>
          <Text style={styles.dismiss_text}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  duration_container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  duration_value: {
    fontSize: 48,
    fontWeight: '200',
    color: '#6C63FF',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  duration_label: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 4,
  },
  details: {
    width: '100%',
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  detail_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detail_text: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  dismiss_button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  dismiss_text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
