import { supabase } from '@/lib/supabase';
import { Order, OrderItem, CartItem } from '@/types';

export const orderService = {
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'accepted_at' | 'delivered_at'>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async createOrderItems(items: Omit<OrderItem, 'id'>[]) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert(items)
        .select();

      if (error) throw error;
      return data as OrderItem[];
    } catch (error) {
      console.error('Error creating order items:', error);
      throw error;
    }
  },

  async getOrderById(id: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Order | null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  async getOrderItems(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data as OrderItem[];
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  },

  async getCustomerOrders(customerId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Order[];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },

  async getRestaurantOrders(restaurantId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Order[];
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      return [];
    }
  },

  async getBikerOrders(bikerId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('biker_id', bikerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Order[];
    } catch (error) {
      console.error('Error fetching biker orders:', error);
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  async assignBiker(orderId: string, bikerId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          biker_id: bikerId,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error assigning biker:', error);
      throw error;
    }
  },

  async completeOrder(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  },
};
