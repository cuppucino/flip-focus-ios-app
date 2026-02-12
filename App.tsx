import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { HomeScreen } from './screens/HomeScreen';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let icon_name: keyof typeof Ionicons.glyphMap = 'home';

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
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: styles.tab_bar,
          tabBarLabelStyle: styles.tab_label,
          tabBarItemStyle: styles.tab_item,
        })}
      >
        <Tab.Screen name="Focus" component={HomeScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tab_bar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tab_label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tab_item: {
    paddingVertical: 4,
  },
});
