import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import VenueMapScreen from '../screens/map/VenueMapScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Admin Suite
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminCreateEventScreen from '../screens/admin/AdminCreateEventScreen';
import AdminEditEventScreen from '../screens/admin/AdminEditEventScreen';
import AdminMapEditorScreen from '../screens/admin/AdminMapEditorScreen';
import ManagerBannersScreen from '../screens/admin/ManagerBannersScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen
          name="VenueMap"
          component={VenueMapScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        {/* Admin Stack */}
        <Stack.Screen name="AdminTab" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminCreateEvent" component={AdminCreateEventScreen} />
        <Stack.Screen name="AdminEditEvent" component={AdminEditEventScreen} />
        <Stack.Screen name="AdminMapEditor" component={AdminMapEditorScreen} />
        <Stack.Screen name="ManagerBanners" component={ManagerBannersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
