import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import {
  Clock,
  CheckCircle,
  XCircle,
  Bike,
  Package,
  MapPin,
  Phone,
  DollarSign,
} from 'lucide-react-native';

interface Order {
  id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string;
  created_at: string;
  customer: {
    full_name: string;
    phone: string;
  };
  biker: {
    full_name: string;
    phone: string;
  } | null;
  order_items: Array<{
    quantity: number;
    price: number;
    dish: {
      name: string;
    };
  }>;
}

interface OrdersManagerProps {
  restaurantId: string;
  colors: any;
}

export default function OrdersManager({ restaurantId, colors }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'accepted' | 'collecting' | 'delivering'>('all');

  useEffect(() => {
    loadOrders();

    const subscription = supabase
      .channel('restaurant_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [restaurantId]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:users!orders_customer_id_fkey(full_name, phone),
          biker:users!orders_biker_id_fkey(full_name, phone),
          order_items(
            quantity,
            price,
            dish:dishes(name)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('id', orderId);

              if (error) throw error;
              loadOrders();
            } catch (error) {
              console.error('Error rejecting order:', error);
              Alert.alert('Error', 'Failed to reject order');
            }
          },
        },
      ]
    );
  };

  const handleRequestBiker = async (orderId: string) => {
    Alert.alert(
      'Request Biker',
      'Broadcast this order to available bikers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({ status: 'collecting', updated_at: new Date().toISOString() })
                .eq('id', orderId);

              if (error) throw error;
              Alert.alert('Success', 'Biker request sent to available bikers');
              loadOrders();
            } catch (error) {
              console.error('Error requesting biker:', error);
              Alert.alert('Error', 'Failed to request biker');
            }
          },
        },
      ]
    );
  };

  const handleConfirmPickup = async (orderId: string) => {
    Alert.alert(
      'Confirm Pickup',
      'Confirm that the biker has picked up this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({ status: 'delivering', updated_at: new Date().toISOString() })
                .eq('id', orderId);

              if (error) throw error;
              Alert.alert('Success', 'Order pickup confirmed. Biker is now delivering.');
              loadOrders();
            } catch (error) {
              console.error('Error confirming pickup:', error);
              Alert.alert('Error', 'Failed to confirm pickup');
            }
          },
        },
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'waiting':
        return { label: 'New Order', color: Colors.warning, icon: Clock };
      case 'accepted':
        return { label: 'Preparing', color: Colors.primary, icon: Package };
      case 'collecting':
        return { label: 'Awaiting Pickup', color: Colors.info, icon: Bike };
      case 'delivering':
        return { label: 'Out for Delivery', color: Colors.success, icon: Bike };
      case 'completed':
        return { label: 'Completed', color: Colors.success, icon: CheckCircle };
      case 'cancelled':
        return { label: 'Cancelled', color: Colors.error, icon: XCircle };
      default:
        return { label: status, color: Colors.muted, icon: Clock };
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Orders</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {['all', 'waiting', 'accepted', 'collecting', 'delivering'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive,
                { borderColor: colors.border },
              ]}
              onPress={() => setFilter(f as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: filter === f ? Colors.white : colors.text },
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadOrders} colors={[Colors.primary]} />
        }
      >
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;

          return (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card }]}>
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Text style={[styles.orderId, { color: colors.text }]}>
                    Order #{order.id.slice(0, 8)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                    <StatusIcon size={14} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.orderTime, { color: colors.muted }]}>
                  {new Date(order.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.orderBody}>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Items</Text>
                  {order.order_items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={[styles.itemQuantity, { color: colors.muted }]}>
                        {item.quantity}x
                      </Text>
                      <Text style={[styles.itemName, { color: colors.text }]}>
                        {item.dish.name}
                      </Text>
                      <Text style={[styles.itemPrice, { color: colors.text }]}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.section}>
                  <View style={styles.infoRow}>
                    <MapPin size={16} color={colors.muted} />
                    <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
                      {order.delivery_address}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Phone size={16} color={colors.muted} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      {order.customer.full_name} - {order.customer.phone || 'No phone'}
                    </Text>
                  </View>
                  {order.biker && (
                    <View style={styles.infoRow}>
                      <Bike size={16} color={colors.muted} />
                      <Text style={[styles.infoText, { color: colors.text }]}>
                        {order.biker.full_name} - {order.biker.phone || 'No phone'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                  <Text style={[styles.totalAmount, { color: Colors.primary }]}>
                    ${order.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderActions}>
                {order.status === 'waiting' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonReject]}
                      onPress={() => handleRejectOrder(order.id)}
                    >
                      <Text style={styles.actionButtonTextReject}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonAccept]}
                      onPress={() => handleAcceptOrder(order.id)}
                    >
                      <Text style={styles.actionButtonTextAccept}>Accept</Text>
                    </TouchableOpacity>
                  </>
                )}
                {order.status === 'accepted' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleRequestBiker(order.id)}
                  >
                    <Bike size={18} color={Colors.white} />
                    <Text style={styles.actionButtonTextPrimary}>Request Biker</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'collecting' && order.biker && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleConfirmPickup(order.id)}
                  >
                    <CheckCircle size={18} color={Colors.white} />
                    <Text style={styles.actionButtonTextPrimary}>Confirm Pickup</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={64} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No {filter !== 'all' ? filter : ''} orders yet
            </Text>
          </View>
        )}
      </ScrollView>
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
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    ...Typography.title,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  orderCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  orderId: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  orderTime: {
    ...Typography.caption,
  },
  orderBody: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemQuantity: {
    ...Typography.caption,
    width: 30,
  },
  itemName: {
    ...Typography.body,
    flex: 1,
  },
  itemPrice: {
    ...Typography.body,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.caption,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...Typography.subheadline,
    fontWeight: '600',
  },
  totalAmount: {
    ...Typography.title,
    fontWeight: '700',
  },
  orderActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionButtonReject: {
    backgroundColor: Colors.error + '20',
  },
  actionButtonAccept: {
    backgroundColor: Colors.success,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  actionButtonTextReject: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.error,
  },
  actionButtonTextAccept: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.white,
  },
  actionButtonTextPrimary: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
});
