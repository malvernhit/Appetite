import { supabase } from '@/lib/supabase';
import { Dish } from '@/types';

export const dishService = {
  async getDishesByRestaurant(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dish[];
    } catch (error) {
      console.error('Error fetching dishes:', error);
      return [];
    }
  },

  async getDishesByCategory(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_available', true);

      if (error) throw error;
      return data as Dish[];
    } catch (error) {
      console.error('Error fetching dishes by category:', error);
      return [];
    }
  },

  async getDishById(id: string) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Dish | null;
    } catch (error) {
      console.error('Error fetching dish:', error);
      return null;
    }
  },

  async createDish(dish: Omit<Dish, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .insert([dish])
        .select()
        .single();

      if (error) throw error;
      return data as Dish;
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  },

  async updateDish(id: string, updates: Partial<Dish>) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Dish;
    } catch (error) {
      console.error('Error updating dish:', error);
      throw error;
    }
  },

  async deleteDish(id: string) {
    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting dish:', error);
      throw error;
    }
  },
};
