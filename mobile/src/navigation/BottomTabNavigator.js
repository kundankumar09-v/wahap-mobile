import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/home/HomeScreen';
import EventListScreen from '../screens/events/EventListScreen';
import QrScannerScreen from '../screens/qr/QrScannerScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="EventsTab"
        component={EventListScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={23}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="QrTab"
        component={QrScannerScreen}
        options={{
          tabBarLabel: 'Scan QR',
          tabBarIcon: ({ focused }) => (
            <View style={styles.scanQrCenterBtn}>
              <Ionicons name="qr-code" size={24} color="#ffffff" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={SignInScreen}
        options={{
          tabBarLabel: user ? 'Account' : 'Sign In',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={23}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0b0f19',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  scanQrCenterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 14 : 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#0b0f19',
  },
});
