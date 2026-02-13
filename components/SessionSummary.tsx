import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format_duration } from '../utils/statsHelpers';
import { useTheme } from '../context/ThemeContext';

interface SessionSummaryProps {
  duration: number;        // seconds
  start_time: number;      // timestamp
  tag?: { emoji: string; label: string };
  on_dismiss: () => void;
}

// Particle config for confetti burst
const PARTICLE_COUNT = 24;
const PARTICLE_COLORS = ['#6C63FF', '#A78BFA', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

const create_particles = () =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (i / PARTICLE_COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.5,
    distance: 80 + Math.random() * 100,
    size: 4 + Math.random() * 6,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    delay: Math.random() * 200,
  }));

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  duration,
  start_time,
  tag,
  on_dismiss,
}) => {
  const { colors } = useTheme();

  // Entrance animation
  const slide_anim = useRef(new Animated.Value(0)).current;
  // Counter animation
  const [display_duration, set_display_duration] = useState(0);
  const counter_started = useRef(false);
  // Particle animations
  const particle_anim = useRef(new Animated.Value(0)).current;
  const particles = useRef(create_particles()).current;

  const show_confetti = duration >= 25 * 60; // >= 25 minutes

  useEffect(() => {
    // Slide/fade entrance
    Animated.spring(slide_anim, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      // Start counter after entrance finishes
      if (!counter_started.current) {
        counter_started.current = true;
        animate_counter();
      }
    });

    // Fire confetti
    if (show_confetti) {
      Animated.timing(particle_anim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
        delay: 300,
      }).start();
    }
  }, []);

  const animate_counter = () => {
    const start = Date.now();
    const anim_duration_ms = Math.min(1500, duration * 15); // cap at 1.5s

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / anim_duration_ms, 1);
      // Ease-out for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      set_display_duration(Math.floor(eased * duration));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        set_display_duration(duration);
      }
    };
    requestAnimationFrame(tick);
  };

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

  const card_translate_y = slide_anim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  return (
    <View style={styles.overlay}>
      {/* Confetti particles */}
      {show_confetti &&
        particles.map((p) => {
          const translate_x = particle_anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.cos(p.angle) * p.distance],
          });
          const translate_y = particle_anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.sin(p.angle) * p.distance],
          });
          const opacity = particle_anim.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [0, 1, 1, 0],
          });
          const scale = particle_anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1.2, 0.3],
          });

          return (
            <Animated.View
              key={p.id}
              style={[
                styles.particle,
                {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: p.color,
                  opacity,
                  transform: [{ translateX: translate_x }, { translateY: translate_y }, { scale }],
                },
              ]}
            />
          );
        })}

      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.bg_card,
            opacity: slide_anim,
            transform: [{ translateY: card_translate_y }],
          },
        ]}
      >
        {/* Big Emoji */}
        <Text style={styles.emoji}>{rating.emoji}</Text>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text_primary }]}>{rating.title}</Text>

        {/* Duration (animated counter) */}
        <View style={styles.duration_container}>
          <Text style={[styles.duration_value, { color: colors.accent }]}>
            {format_duration(display_duration)}
          </Text>
          <Text style={[styles.duration_label, { color: colors.text_tertiary }]}>of deep focus</Text>
        </View>

        {/* Details */}
        <View style={[styles.details, { backgroundColor: colors.bg_primary }]}>
          {tag && (
            <View style={styles.detail_row}>
              <Text style={{ fontSize: 16 }}>{tag.emoji}</Text>
              <Text style={[styles.detail_text, { color: colors.text_secondary }]}>{tag.label}</Text>
            </View>
          )}
          <View style={styles.detail_row}>
            <Ionicons name="time-outline" size={16} color={colors.text_tertiary} />
            <Text style={[styles.detail_text, { color: colors.text_secondary }]}>Started at {time_str}</Text>
          </View>
          <View style={styles.detail_row}>
            <Ionicons name="hourglass-outline" size={16} color={colors.text_tertiary} />
            <Text style={[styles.detail_text, { color: colors.text_secondary }]}>
              {Math.floor(duration / 60)} min {duration % 60} sec
            </Text>
          </View>
        </View>

        {/* Message */}
        <Text style={[styles.message, { color: colors.text_secondary }]}>{rating.message}</Text>

        {/* Dismiss */}
        <TouchableOpacity style={[styles.dismiss_button, { backgroundColor: colors.accent }]} onPress={on_dismiss}>
          <Text style={styles.dismiss_text}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  duration_label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  details: {
    width: '100%',
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
    fontWeight: '500',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  dismiss_button: {
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
  particle: {
    position: 'absolute',
  },
});
