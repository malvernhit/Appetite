import { supabase } from '@/lib/supabase';
import { DeliveryRequest } from '@/types';

export const deliveryService = {
  async createDeliveryRequest(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert([
          {
            order_id: orderId,
            status: 'pending',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as DeliveryRequest;
    } catch (error) {
      console.error('Error creating delivery request:', error);
      throw error;
    }
  },

  async getDeliveryRequestById(id: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as DeliveryRequest | null;
    } catch (error) {
      console.error('Error fetching delivery request:', error);
      return null;
    }
  },

  async getPendingDeliveryRequests(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as DeliveryRequest[];
    } catch (error) {
      console.error('Error fetching pending delivery requests:', error);
      return [];
    }
  },

  async acceptDeliveryRequest(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({
          status: 'accepted',
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data as DeliveryRequest;
    } catch (error) {
      console.error('Error accepting delivery request:', error);
      throw error;
    }
  },

  async declineDeliveryRequest(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({
          status: 'declined',
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data as DeliveryRequest;
    } catch (error) {
      console.error('Error declining delivery request:', error);
      throw error;
    }
  },

  async getDeliveryRequestByOrderId(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data as DeliveryRequest | null;
    } catch (error) {
      console.error('Error fetching delivery request by order:', error);
      return null;
    }
  },
};
