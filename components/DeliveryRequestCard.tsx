import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, DollarSign, Navigation } from 'lucide-react-native';
import { Colors, Typography, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { DeliveryRequest } from '@/types';
import Button from './Button';

interface DeliveryRequestCardProps {
  request: DeliveryRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export default function DeliveryRequestCard({
  request,
  onAccept,
  onDecline,
}: DeliveryRequestCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.restaurant}>{request.restaurantName}</Text>
        <View style={styles.earnings}>
          <DollarSign size={18} color={Colors.success} />
          <Text style={styles.earningsText}>${request.estimatedEarnings.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.location}>
        <MapPin size={16} color={Colors.primary} />
        <View style={styles.locationText}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.address}>{request.restaurantAddress}</Text>
        </View>
      </View>

      <View style={styles.location}>
        <MapPin size={16} color={Colors.success} />
        <View style={styles.locationText}>
          <Text style={styles.label}>Drop-off</Text>
          <Text style={styles.address}>{request.customerAddress}</Text>
        </View>
      </View>

      <View style={styles.distances}>
        <View style={styles.distanceItem}>
          <Navigation size={14} color={Colors.text} />
          <Text style={styles.distanceText}>
            {request.pickupDistance.toFixed(1)} km to pickup
          </Text>
        </View>
        <View style={styles.distanceItem}>
          <Navigation size={14} color={Colors.text} />
          <Text style={styles.distanceText}>
            {request.dropoffDistance.toFixed(1)} km to deliver
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Decline" onPress={onDecline} variant="secondary" style={styles.button} />
        <Button title="Accept" onPress={onAccept} variant="success" style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  restaurant: {
    ...Typography.subheadline,
    color: Colors.text,
    flex: 1,
  },
  earnings: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  earningsText: {
    ...Typography.bodyMedium,
    color: Colors.success,
    fontWeight: '700',
    marginLeft: 4,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  locationText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    color: Colors.dark.muted,
    marginBottom: 2,
  },
  address: {
    ...Typography.body,
    color: Colors.text,
  },
  distances: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    ...Typography.caption,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
