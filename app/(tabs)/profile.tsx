import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Package,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bike,
  Moon,
  Sun,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useThemedColors } from '@/hooks/useThemedColors';

export default function ProfileScreen() {
  const { user, userMode, setUserMode, theme, toggleTheme, signOut } = useApp();
  const colors = useThemedColors();
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || '');
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
    }
  }, [user]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', onPress: () => {} },
    { icon: Package, label: 'Order History', onPress: () => {} },
    { icon: CreditCard, label: 'Payment Methods', onPress: () => {} },
    { icon: Settings, label: 'Settings', onPress: () => {} },
    { icon: HelpCircle, label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatar}>
            <User size={40} color={Colors.white} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{userName}</Text>
          <Text style={[styles.email, { color: colors.muted }]}>{userEmail}</Text>
        </View>

        <View style={[styles.modeCard, { backgroundColor: colors.card }]}>
          <View style={styles.modeHeader}>
            <View style={[styles.modeIcon, { backgroundColor: colors.background }]}>
              <Bike size={24} color={Colors.primary} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeLabel, { color: colors.text }]}>Biker Mode</Text>
              <Text style={[styles.modeSubtext, { color: colors.muted }]}>
                {userMode === 'biker' ? 'Accept deliveries' : 'Switch to start earning'}
              </Text>
            </View>
          </View>
          <Switch
            value={userMode === 'biker'}
            onValueChange={(value) => setUserMode(value ? 'biker' : 'customer')}
            trackColor={{ false: colors.neutral, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={[styles.modeCard, { backgroundColor: colors.card }]}>
          <View style={styles.modeHeader}>
            <View style={[styles.modeIcon, { backgroundColor: colors.background }]}>
              {theme === 'light' ? (
                <Sun size={24} color={Colors.accent} />
              ) : (
                <Moon size={24} color={Colors.dark.accent} />
              )}
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.modeSubtext, { color: colors.muted }]}>
                {theme === 'dark' ? 'Currently using dark theme' : 'Switch to dark theme'}
              </Text>
            </View>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.neutral, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={[styles.menu, { backgroundColor: colors.card }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }, index === menuItems.length - 1 && styles.menuItemLast]}
              onPress={item.onPress}
            >
              <item.icon size={20} color={colors.text} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <ChevronRight size={20} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <LogOut size={20} color={Colors.primary} />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.muted }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral,
  },
  title: {
    ...Typography.headline,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.subheadline,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    ...Typography.body,
    color: Colors.dark.muted,
  },
  modeCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  modeLabel: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  modeSubtext: {
    ...Typography.caption,
    color: Colors.dark.muted,
  },
  menu: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  logoutText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  version: {
    ...Typography.caption,
    color: Colors.dark.muted,
    textAlign: 'center',
  },
});
