import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { CircularProgress } from './CircularProgress';
import { format_timer } from '../utils/statsHelpers';

interface TimerDisplayProps {
  seconds: number;
  is_active: boolean;
  daily_goal_minutes: number;
  today_total_seconds: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  is_active,
  daily_goal_minutes,
  today_total_seconds,
}) => {
  const pulse_anim = useRef(new Animated.Value(1)).current;
  const glow_anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (is_active) {
      // Breathing pulse animation
      const pulse_loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse_anim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse_anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse_loop.start();

      // Glow animation
      const glow_loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glow_anim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glow_anim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );
      glow_loop.start();

      return () => {
        pulse_loop.stop();
        glow_loop.stop();
      };
    } else {
      pulse_anim.setValue(1);
      glow_anim.setValue(0.3);
    }
  }, [is_active]);

  // Calculate daily goal progress (including current session)
  const total_today = today_total_seconds + (is_active ? seconds : 0);
  const goal_seconds = daily_goal_minutes * 60;
  const goal_progress = goal_seconds > 0 ? total_today / goal_seconds : 0;

  // Timer progress for the current session (cycles every 60 min)
  const session_progress = is_active ? (seconds % 3600) / 3600 : 0;

  const messages = [
    'Stay in the zone 🎯',
    'Deep work mode 🧠',
    'You are crushing it 💪',
    'Focus is a superpower ⚡',
    'Keep the momentum 🚀',
  ];
  const message_index = Math.floor(seconds / 30) % messages.length;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ring_container, { transform: [{ scale: pulse_anim }] }]}>
        <CircularProgress
          size={280}
          stroke_width={is_active ? 8 : 6}
          progress={is_active ? session_progress : goal_progress}
          color_start={is_active ? '#6C63FF' : '#10B981'}
          color_end={is_active ? '#A78BFA' : '#34D399'}
          bg_color={is_active ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
        >
          <View style={styles.inner_content}>
            <Text style={[styles.timer_text, is_active ? styles.active_text : styles.idle_text]}>
              {format_timer(seconds)}
            </Text>
            <Text style={[styles.status_text, is_active ? styles.active_status : styles.idle_status]}>
              {is_active ? messages[message_index] : 'Flip to Focus'}
            </Text>
          </View>
        </CircularProgress>
      </Animated.View>

      {/* Goal progress indicator (shown when idle) */}
      {!is_active && daily_goal_minutes > 0 && (
        <View style={styles.goal_container}>
          <Text style={styles.goal_text}>
            Daily Goal: {Math.round(total_today / 60)}m / {daily_goal_minutes}m
          </Text>
          <View style={styles.goal_bar_bg}>
            <View
              style={[
                styles.goal_bar_fill,
                { width: `${Math.min(goal_progress * 100, 100)}%` },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring_container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner_content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer_text: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  active_text: {
    color: '#FFFFFF',
  },
  idle_text: {
    color: '#1a1a2e',
  },
  status_text: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  active_status: {
    color: 'rgba(255,255,255,0.7)',
  },
  idle_status: {
    color: '#6B7280',
  },
  goal_container: {
    marginTop: 30,
    alignItems: 'center',
    width: 240,
  },
  goal_text: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  goal_bar_bg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goal_bar_fill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});
