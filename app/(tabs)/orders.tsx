import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Phone,
  MessageCircle,
  Star,
  MapPin,
  Navigation2,
  Package,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useThemedColors } from '@/hooks/useThemedColors';
import Button from '@/components/Button';

export default function TrackingScreen() {
  const router = useRouter();
  const { currentOrder } = useApp();
  const colors = useThemedColors();

  if (!currentOrder) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Tracking</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Package size={48} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No active orders</Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            Your orders will appear here for tracking
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const orderStatus = currentOrder.status || 'waiting';

  const getStatusText = () => {
    switch (orderStatus) {
      case 'waiting':
        return 'Waiting for biker to accept...';
      case 'accepted':
        return 'Biker accepted & heading to restaurant';
      case 'collecting':
        return 'Biker is collecting your food';
      case 'delivering':
        return 'Your food is on the way!';
      default:
        return 'Processing order...';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Tracking</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <MapPin size={40} color={Colors.primary} />
            <Text style={styles.mapText}>Map View</Text>
            <View style={styles.mockRoute}>
              <View style={styles.pin}>
                <Text style={styles.pinText}>🍴</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.pin}>
                <Text style={styles.pinText}>🏍️</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.pin}>
                <Text style={styles.pinText}>🏠</Text>
              </View>
            </View>
            <View style={[styles.etaContainer, { backgroundColor: colors.card }]}>
              <Navigation2 size={16} color={Colors.primary} />
              <Text style={[styles.etaText, { color: colors.text }]}>15-20 min • 2.3 km away</Text>
            </View>
          </View>
        </View>

        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.neutral }]} />

          <Text style={[styles.status, { color: colors.text }]}>{getStatusText()}</Text>

          {orderStatus !== 'waiting' && currentOrder.biker && (
            <View style={[styles.bikerCard, { backgroundColor: colors.background }]}>
              <Image source={{ uri: currentOrder.biker.photo }} style={styles.bikerPhoto} />
              <View style={styles.bikerInfo}>
                <Text style={[styles.bikerName, { color: colors.text }]}>
                  {currentOrder.biker.name}
                </Text>
                <View style={styles.bikerMeta}>
                  <Star size={14} color={Colors.accent} fill={Colors.accent} />
                  <Text style={[styles.bikerRating, { color: colors.text }]}>
                    {currentOrder.biker.rating}
                  </Text>
                  <Text style={[styles.bikerPlate, { color: colors.muted }]}>
                    • {currentOrder.biker.bikePlate}
                  </Text>
                </View>
              </View>
              <View style={styles.bikerActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/chat')}
                >
                  <MessageCircle size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
                  <Phone size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.orderDetails}>
            <Text style={[styles.orderTitle, { color: colors.text }]}>
              Order from {currentOrder.restaurant.name}
            </Text>
            {currentOrder.items.map((item) => (
              <View key={item.dish.id} style={styles.orderItem}>
                <Text style={[styles.orderItemQuantity, { color: colors.muted }]}>
                  {item.quantity}x
                </Text>
                <Text style={[styles.orderItemName, { color: colors.text }]}>{item.dish.name}</Text>
                <Text style={[styles.orderItemPrice, { color: colors.text }]}>
                  ${(item.dish.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={[styles.orderTotal, { borderTopColor: colors.border }]}>
              <Text style={[styles.orderTotalLabel, { color: colors.text }]}>Total</Text>
              <Text style={styles.orderTotalValue}>${currentOrder.total.toFixed(2)}</Text>
            </View>
          </View>

          {orderStatus === 'delivering' && (
            <Button
              title="I've received my order ✓"
              onPress={() => {}}
              variant="success"
              style={styles.completeButton}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...Typography.headline,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.subheadline,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.body,
    textAlign: 'center',
  },
  mapContainer: {
    height: 300,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  mapText: {
    ...Typography.body,
    color: Colors.dark.muted,
    marginTop: Spacing.sm,
  },
  mockRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  pinText: {
    fontSize: 20,
  },
  routeLine: {
    width: 40,
    height: 3,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    ...Shadows.card,
  },
  etaText: {
    ...Typography.bodyMedium,
    marginLeft: Spacing.sm,
  },
  modal: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    ...Shadows.floating,
    marginTop: -24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.round,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  status: {
    ...Typography.subheadline,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  bikerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bikerPhoto: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
  },
  bikerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  bikerName: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.xs,
  },
  bikerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bikerRating: {
    ...Typography.caption,
    marginLeft: 4,
  },
  bikerPlate: {
    ...Typography.caption,
    marginLeft: 4,
  },
  bikerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  orderDetails: {
    marginBottom: Spacing.lg,
  },
  orderTitle: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderItemQuantity: {
    ...Typography.body,
    width: 30,
  },
  orderItemName: {
    ...Typography.body,
    flex: 1,
  },
  orderItemPrice: {
    ...Typography.bodyMedium,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  orderTotalLabel: {
    ...Typography.subheadline,
  },
  orderTotalValue: {
    ...Typography.subheadline,
    color: Colors.primary,
    fontWeight: '700',
  },
  completeButton: {
    marginTop: Spacing.md,
  },
});
