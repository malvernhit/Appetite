import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useThemedColors } from '@/hooks/useThemedColors';
import Button from '@/components/Button';
import { orderService } from '@/services/orderService';
import { restaurantService } from '@/services/restaurantService';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, setCurrentOrder, user } = useApp();
  const colors = useThemedColors();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const deliveryFee = 3.99;
  const total = subtotal + deliveryFee;

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    if (!user) {
      Alert.alert('Error', 'Please sign in to place an order');
      return;
    }

    try {
      setIsProcessing(true);
      const restaurantId = cart[0].dish.restaurant_id;
      const restaurant = await restaurantService.getRestaurantById(restaurantId);

      if (!restaurant) {
        Alert.alert('Error', 'Restaurant not found');
        return;
      }

      const orderData = {
        customer_id: user.id,
        biker_id: null,
        restaurant_id: restaurant.id,
        status: 'pending' as const,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        delivery_address: 'Current Location',
        delivery_latitude: null,
        delivery_longitude: null,
        notes: '',
      };

      const createdOrder = await orderService.createOrder(orderData);

      const orderItems = cart.map((item) => ({
        order_id: createdOrder.id,
        dish_id: item.dish.id,
        quantity: item.quantity,
        price: item.dish.price,
        notes: item.notes || '',
      }));

      await orderService.createOrderItems(orderItems);

      setCurrentOrder(createdOrder);
      clearCart();
      router.push('/(tabs)/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Your cart is empty</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {cart.map((item) => (
          <View key={item.dish.id} style={[styles.cartItem, { backgroundColor: colors.card }]}>
            <Image source={{ uri: item.dish.image_url || 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg' }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.dish.name}</Text>
              <Text style={styles.itemPrice}>${item.dish.price.toFixed(2)}</Text>
              <Text style={[styles.itemQuantity, { color: colors.muted }]}>Quantity: {item.quantity}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(item.dish.id)}
            >
              <Trash2 size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={[styles.summary, { backgroundColor: colors.card }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          title={isProcessing ? "Processing..." : "Confirm Order"}
          onPress={handleConfirmOrder}
          disabled={isProcessing}
        />
        {isProcessing && <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.md }} />}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.dark.muted,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  itemDetails: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  itemName: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  itemQuantity: {
    ...Typography.caption,
    color: Colors.dark.muted,
  },
  removeButton: {
    padding: Spacing.sm,
    justifyContent: 'center',
  },
  summary: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.card,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  summaryValue: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral,
    paddingTop: Spacing.md,
    marginBottom: 0,
  },
  totalLabel: {
    ...Typography.subheadline,
    color: Colors.text,
  },
  totalValue: {
    ...Typography.subheadline,
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral,
  },
});
