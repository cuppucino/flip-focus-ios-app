import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StreakBadgeProps {
  streak: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  const { is_dark } = useTheme();

  if (streak === 0) return null;

  const get_streak_message = (days: number): string => {
    if (days >= 30) return 'Legendary! 🏆';
    if (days >= 14) return 'Unstoppable! 💎';
    if (days >= 7) return 'On fire! 🔥';
    if (days >= 3) return 'Building momentum! ⚡';
    return 'Great start! 🌱';
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.badge,
        is_dark && { backgroundColor: 'rgba(254, 243, 199, 0.12)', borderColor: 'rgba(252, 211, 77, 0.3)' },
      ]}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.text_container}>
          <Text style={[styles.streak_number, is_dark && { color: '#FCD34D' }]}>{streak}-day streak</Text>
          <Text style={[styles.streak_message, is_dark && { color: '#FBBF24' }]}>{get_streak_message(streak)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  flame: {
    fontSize: 22,
    marginRight: 10,
  },
  text_container: {
    alignItems: 'flex-start',
  },
  streak_number: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  streak_message: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500',
    marginTop: 1,
  },
});
