import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { Home, Compass, ShoppingBag, Heart, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedColors';

export default function TabsLayout() {
  const router = useRouter();
  const colors = useThemedColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          height: Platform.OS === 'ios' ? 90 : 75,
          paddingBottom: Platform.OS === 'ios' ? 30 : 15,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => <Compass size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ size, color }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ size, color }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
