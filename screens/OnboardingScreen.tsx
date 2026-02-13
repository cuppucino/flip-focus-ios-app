import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { save_settings } from '../storage/settingsStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPageData {
  icon: keyof typeof Ionicons.glyphMap;
  icon_color: string;
  title: string;
  subtitle: string;
  bg_accent: string;
}

const PAGES: OnboardingPageData[] = [
  {
    icon: 'phone-portrait-outline',
    icon_color: '#A78BFA',
    title: 'Flip & Focus',
    subtitle:
      'Start a session, then flip your phone face-down\nor lock the screen.\n\nThe timer starts automatically\nwhen you put your phone away.',
    bg_accent: 'rgba(167, 139, 250, 0.12)',
  },
  {
    icon: 'lock-closed-outline',
    icon_color: '#6C63FF',
    title: 'Stay Focused',
    subtitle:
      'Your session runs silently in the background.\nA Live Activity shows your progress\non the Lock Screen & Dynamic Island.\n\nUnlocking your phone ends the session.',
    bg_accent: 'rgba(108, 99, 255, 0.12)',
  },
  {
    icon: 'stats-chart-outline',
    icon_color: '#10B981',
    title: 'Track Progress',
    subtitle:
      'See your daily stats, streaks, and weekly charts.\nSet goals and build your focus habit\none session at a time.',
    bg_accent: 'rgba(16, 185, 129, 0.12)',
  },
];

interface OnboardingScreenProps {
  on_complete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ on_complete }) => {
  const pager_ref = useRef<PagerView>(null);
  const [current_page, set_current_page] = useState(0);
  const btn_scale = useRef(new Animated.Value(1)).current;

  const handle_get_started = async () => {
    try {
      Animated.sequence([
        Animated.timing(btn_scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.timing(btn_scale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();

      await save_settings({ has_seen_onboarding: true });
      on_complete();
    } catch (e) {
      console.error('Onboarding complete failed', e);
    }
  };

  const handle_next = () => {
    if (current_page < PAGES.length - 1) {
      pager_ref.current?.setPage(current_page + 1);
    }
  };

  const is_last = current_page === PAGES.length - 1;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe_area}>
        {/* Skip button */}
        {!is_last && (
          <TouchableOpacity style={styles.skip_button} onPress={handle_get_started}>
            <Text style={styles.skip_text}>Skip</Text>
          </TouchableOpacity>
        )}

        <PagerView
          ref={pager_ref}
          style={styles.pager}
          initialPage={0}
          onPageSelected={(e) => set_current_page(e.nativeEvent.position)}
        >
          {PAGES.map((page, index) => (
            <View key={index} style={styles.page}>
              <View style={[styles.icon_circle, { backgroundColor: page.bg_accent }]}>
                <Ionicons name={page.icon} size={64} color={page.icon_color} />
              </View>
              <Text style={styles.title}>{page.title}</Text>
              <Text style={styles.subtitle}>{page.subtitle}</Text>
            </View>
          ))}
        </PagerView>

        {/* Bottom section */}
        <View style={styles.bottom}>
          {/* Page indicators */}
          <View style={styles.indicators}>
            {PAGES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === current_page ? styles.dot_active : styles.dot_inactive,
                ]}
              />
            ))}
          </View>

          {/* Action button */}
          {is_last ? (
            <Animated.View style={{ transform: [{ scale: btn_scale }], width: '100%' }}>
              <TouchableOpacity
                style={styles.start_button}
                onPress={handle_get_started}
                activeOpacity={0.85}
              >
                <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
                <Text style={styles.start_text}>Get Started</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={styles.next_button}
              onPress={handle_next}
              activeOpacity={0.85}
            >
              <Text style={styles.next_text}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#6C63FF" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  safe_area: {
    flex: 1,
  },
  skip_button: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  skip_text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon_circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot_active: {
    backgroundColor: '#6C63FF',
    width: 24,
  },
  dot_inactive: {
    backgroundColor: '#D1D5DB',
  },
  start_button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  start_text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  next_button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  next_text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
});
