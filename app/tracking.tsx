import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, MessageCircle, Star, MapPin, Navigation2 } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import Button from '@/components/Button';
import { mockBiker } from '@/data/mockData';

export default function TrackingScreen() {
  const router = useRouter();
  const { currentOrder, setCurrentOrder } = useApp();
  const [orderStatus, setOrderStatus] = useState<string>('waiting');

  useEffect(() => {
    if (!currentOrder) {
      router.replace('/(tabs)');
      return;
    }

    const timer1 = setTimeout(() => {
      setOrderStatus('accepted');
      setCurrentOrder({ ...currentOrder, status: 'accepted', biker: mockBiker });
    }, 3000);

    const timer2 = setTimeout(() => {
      setOrderStatus('collecting');
      setCurrentOrder({ ...currentOrder, status: 'collecting', biker: mockBiker });
    }, 6000);

    const timer3 = setTimeout(() => {
      setOrderStatus('delivering');
      setCurrentOrder({ ...currentOrder, status: 'delivering', biker: mockBiker });
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (!currentOrder) return null;

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

  const handleComplete = () => {
    setCurrentOrder(null);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

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
          <View style={styles.etaContainer}>
            <Navigation2 size={16} color={Colors.primary} />
            <Text style={styles.etaText}>15-20 min • 2.3 km away</Text>
          </View>
        </View>
      </View>

      <View style={styles.modal}>
        <View style={styles.handle} />

        <Text style={styles.status}>{getStatusText()}</Text>

        {orderStatus !== 'waiting' && currentOrder.biker && (
          <View style={styles.bikerCard}>
            <Image source={{ uri: currentOrder.biker.photo }} style={styles.bikerPhoto} />
            <View style={styles.bikerInfo}>
              <Text style={styles.bikerName}>{currentOrder.biker.name}</Text>
              <View style={styles.bikerMeta}>
                <Star size={14} color={Colors.accent} fill={Colors.accent} />
                <Text style={styles.bikerRating}>{currentOrder.biker.rating}</Text>
                <Text style={styles.bikerPlate}>• {currentOrder.biker.bikePlate}</Text>
              </View>
            </View>
            <View style={styles.bikerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/chat')}
              >
                <MessageCircle size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.orderDetails}>
          <Text style={styles.orderTitle}>Order from {currentOrder.restaurant.name}</Text>
          {currentOrder.items.map((item) => (
            <View key={item.dish.id} style={styles.orderItem}>
              <Text style={styles.orderItemQuantity}>{item.quantity}x</Text>
              <Text style={styles.orderItemName}>{item.dish.name}</Text>
              <Text style={styles.orderItemPrice}>
                ${(item.dish.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total</Text>
            <Text style={styles.orderTotalValue}>${currentOrder.total.toFixed(2)}</Text>
          </View>
        </View>

        {orderStatus === 'delivering' && (
          <Button
            title="I've received my order ✓"
            onPress={handleComplete}
            variant="success"
            style={styles.completeButton}
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
    backgroundColor: Colors.background,
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
  status: {
    ...Typography.subheadline,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  bikerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
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
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  bikerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bikerRating: {
    ...Typography.caption,
    color: Colors.text,
    marginLeft: 4,
  },
  bikerPlate: {
    ...Typography.caption,
    color: Colors.dark.muted,
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
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  orderDetails: {
    marginBottom: Spacing.lg,
  },
  orderTitle: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderItemQuantity: {
    ...Typography.body,
    color: Colors.dark.muted,
    width: 30,
  },
  orderItemName: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  orderItemPrice: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  orderTotalLabel: {
    ...Typography.subheadline,
    color: Colors.text,
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
