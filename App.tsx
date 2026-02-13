import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { HomeScreen } from './screens/HomeScreen';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { get_settings } from './storage/settingsStorage';

import { Audio } from 'expo-av';

const Tab = createMaterialTopTabNavigator();

function AppContent() {
  const { colors, is_dark } = useTheme();
  const [show_onboarding, set_show_onboarding] = useState<boolean | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const settings = await get_settings();
        set_show_onboarding(!settings.has_seen_onboarding);
      } catch (e) {
        console.warn('Error during init:', e);
        set_show_onboarding(false);
      }
    }
    init();
  }, []);

  // Still loading settings
  if (show_onboarding === null) return null;

  if (show_onboarding) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingScreen on_complete={() => set_show_onboarding(false)} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={is_dark ? 'light' : 'dark'} />
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let icon_name: keyof typeof Ionicons.glyphMap = 'home';
            const size = 24;

            switch (route.name) {
              case 'Focus':
                icon_name = focused ? 'radio-button-on' : 'radio-button-off-outline';
                break;
              case 'Stats':
                icon_name = focused ? 'stats-chart' : 'stats-chart-outline';
                break;
              case 'Settings':
                icon_name = focused ? 'settings' : 'settings-outline';
                break;
            }

            return <Ionicons name={icon_name} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.text_tertiary,
          tabBarStyle: {
            backgroundColor: colors.tab_bg,
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: colors.tab_shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            height: 85,
            paddingTop: 8,
            paddingBottom: 28,
          },
          tabBarLabelStyle: styles.tab_label,
          tabBarItemStyle: styles.tab_item,
          tabBarIndicatorStyle: { height: 0 },
          tabBarShowIcon: true,
          swipeEnabled: true,
          animationEnabled: true,
        })}
      >
        <Tab.Screen name="Focus" component={HomeScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tab_label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tab_item: {
    paddingVertical: 4,
  },
});
