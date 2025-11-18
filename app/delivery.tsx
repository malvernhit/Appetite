import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, MessageCircle, MapPin, Navigation2 } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import Button from '@/components/Button';

export default function DeliveryScreen() {
  const router = useRouter();
  const { activeDelivery, setActiveDelivery } = useApp();
  const [deliveryStatus, setDeliveryStatus] = useState<'going_to_pickup' | 'at_restaurant' | 'delivering'>('going_to_pickup');

  useEffect(() => {
    if (!activeDelivery) {
      router.replace('/(tabs)/orders');
    }
  }, [activeDelivery]);

  if (!activeDelivery) return null;

  const handleConfirmPickup = () => {
    setDeliveryStatus('delivering');
  };

  const handleComplete = () => {
    setActiveDelivery(null);
    router.replace('/(tabs)/orders');
  };

  const getStatusText = () => {
    switch (deliveryStatus) {
      case 'going_to_pickup':
        return 'Heading to restaurant';
      case 'at_restaurant':
        return 'At restaurant - collecting food';
      case 'delivering':
        return 'Delivering to customer';
      default:
        return 'Active delivery';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={40} color={Colors.success} />
          <Text style={styles.mapText}>Navigation View</Text>
          <View style={styles.mockRoute}>
            <View style={styles.pin}>
              <Text style={styles.pinText}>🏍️</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.pin}>
              <Text style={styles.pinText}>
                {deliveryStatus === 'delivering' ? '🏠' : '🍴'}
              </Text>
            </View>
          </View>
          <View style={styles.etaContainer}>
            <Navigation2 size={16} color={Colors.success} />
            <Text style={styles.etaText}>
              {deliveryStatus === 'delivering'
                ? `${activeDelivery.dropoffDistance.toFixed(1)} km to customer • 8 min`
                : `${activeDelivery.pickupDistance.toFixed(1)} km to restaurant • 5 min`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.modal}>
        <View style={styles.handle} />

        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, deliveryStatus === 'delivering' && styles.statusDotActive]} />
          <Text style={styles.status}>{getStatusText()}</Text>
        </View>

        {deliveryStatus === 'delivering' ? (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.infoLabel}>Customer</Text>
                <Text style={styles.infoName}>{activeDelivery.customerName}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('/chat')}
                >
                  <MessageCircle size={20} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Phone size={20} color={Colors.success} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.addressContainer}>
              <MapPin size={16} color={Colors.text} />
              <Text style={styles.address}>{activeDelivery.customerAddress}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.infoLabel}>Restaurant</Text>
                <Text style={styles.infoName}>{activeDelivery.restaurantName}</Text>
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.addressContainer}>
              <MapPin size={16} color={Colors.text} />
              <Text style={styles.address}>{activeDelivery.restaurantAddress}</Text>
            </View>
          </View>
        )}

        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Delivery Earnings</Text>
          <Text style={styles.earningsValue}>${activeDelivery.estimatedEarnings.toFixed(2)}</Text>
        </View>

        {deliveryStatus !== 'delivering' ? (
          <Button
            title="Confirm Pickup ✓"
            onPress={handleConfirmPickup}
            variant="success"
            style={styles.actionButtonMain}
          />
        ) : (
          <Button
            title="Complete Delivery ✓"
            onPress={handleComplete}
            variant="success"
            style={styles.actionButtonMain}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.subheadline,
    color: Colors.text,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F5E9',
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
    width: 60,
    height: 3,
    backgroundColor: Colors.success,
    opacity: 0.4,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    ...Shadows.card,
  },
  etaText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    ...Shadows.floating,
    maxHeight: '50%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral,
    borderRadius: BorderRadius.round,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  statusDotActive: {
    backgroundColor: Colors.success,
  },
  status: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.dark.muted,
    marginBottom: Spacing.xs,
  },
  infoName: {
    ...Typography.subheadline,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  earningsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  earningsLabel: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  earningsValue: {
    ...Typography.headline,
    color: Colors.success,
    fontWeight: '700',
  },
  actionButtonMain: {
    marginTop: Spacing.md,
  },
});
