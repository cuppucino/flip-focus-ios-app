import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StreakBadgeProps {
  streak: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
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
      <View style={styles.badge}>
        <Text style={styles.flame}>🔥</Text>
        <View style={styles.text_container}>
          <Text style={styles.streak_number}>{streak}-day streak</Text>
          <Text style={styles.streak_message}>{get_streak_message(streak)}</Text>
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
