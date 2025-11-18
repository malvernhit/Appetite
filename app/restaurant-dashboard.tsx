import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedColors';
import {
  ArrowLeft,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  LayoutGrid,
} from 'lucide-react-native';
import CategoriesManager from '@/components/restaurant/CategoriesManager';
import DishesManager from '@/components/restaurant/DishesManager';
import OrdersManager from '@/components/restaurant/OrdersManager';

type TabType = 'categories' | 'dishes' | 'orders';

export default function RestaurantDashboard() {
  const router = useRouter();
  const { user } = useApp();
  const colors = useThemedColors();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, [user]);

  const loadRestaurant = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        Alert.alert(
          'No Restaurant Found',
          'Please create a restaurant first to access the dashboard.'
        );
        router.back();
        return;
      }

      setRestaurant(data);
    } catch (error) {
      console.error('Error loading restaurant:', error);
      Alert.alert('Error', 'Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No restaurant found
        </Text>
      </View>
    );
  }

  const tabs = [
    { id: 'orders' as TabType, label: 'Orders', icon: ShoppingBag },
    { id: 'categories' as TabType, label: 'Categories', icon: LayoutGrid },
    { id: 'dishes' as TabType, label: 'Menu Items', icon: UtensilsCrossed },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {restaurant.name}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              Restaurant Dashboard
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs Navigation */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  isActive && { borderBottomColor: Colors.primary },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Icon size={20} color={isActive ? Colors.primary : colors.muted} />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? Colors.primary : colors.muted },
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'orders' && (
          <OrdersManager restaurantId={restaurant.id} colors={colors} />
        )}
        {activeTab === 'categories' && (
          <CategoriesManager restaurantId={restaurant.id} colors={colors} />
        )}
        {activeTab === 'dishes' && (
          <DishesManager restaurantId={restaurant.id} colors={colors} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.title,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    ...Typography.bodyMedium,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  errorText: {
    ...Typography.body,
  },
});
