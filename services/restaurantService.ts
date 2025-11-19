import { supabase } from '@/lib/supabase';
import { Restaurant, Dish, FoodCategory } from '@/types';

export const restaurantService = {
  async getRestaurants(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_open', true)
        .limit(limit);

      if (error) throw error;
      return data as Restaurant[];
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }
  },

  async getRestaurantById(id: string) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Restaurant | null;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }
  },

  async getRestaurantsByOwner(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', ownerId);

      if (error) throw error;
      return data as Restaurant[];
    } catch (error) {
      console.error('Error fetching owner restaurants:', error);
      return [];
    }
  },

  async createRestaurant(restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurant])
        .select()
        .single();

      if (error) throw error;
      return data as Restaurant;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Restaurant;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  },

  async getCategories(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FoodCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async createCategory(category: Omit<FoodCategory, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      return data as FoodCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
};
