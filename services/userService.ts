import { supabase } from '@/lib/supabase';
import { User, Biker, UserMode } from '@/types';

export const userService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as User | null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async createUserProfile(user: Omit<User, 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async updateUserMode(userId: string, mode: UserMode) {
    return userService.updateUserProfile(userId, { user_mode: mode });
  },

  async getBikerProfile(bikerId: string) {
    try {
      const { data, error } = await supabase
        .from('bikers')
        .select('*')
        .eq('id', bikerId)
        .maybeSingle();

      if (error) throw error;
      return data as Biker | null;
    } catch (error) {
      console.error('Error fetching biker profile:', error);
      return null;
    }
  },

  async createBikerProfile(biker: Omit<Biker, 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('bikers')
        .insert([biker])
        .select()
        .single();

      if (error) throw error;
      return data as Biker;
    } catch (error) {
      console.error('Error creating biker profile:', error);
      throw error;
    }
  },

  async updateBikerProfile(bikerId: string, updates: Partial<Biker>) {
    try {
      const { data, error } = await supabase
        .from('bikers')
        .update(updates)
        .eq('id', bikerId)
        .select()
        .single();

      if (error) throw error;
      return data as Biker;
    } catch (error) {
      console.error('Error updating biker profile:', error);
      throw error;
    }
  },

  async updateBikerLocation(bikerId: string, latitude: number, longitude: number) {
    return userService.updateBikerProfile(bikerId, {
      current_latitude: latitude,
      current_longitude: longitude,
    });
  },

  async updateBikerStatus(bikerId: string, isActive: boolean) {
    return userService.updateBikerProfile(bikerId, {
      is_active: isActive,
    });
  },

  async getActiveBikers(limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from('bikers')
        .select('*')
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;
      return data as Biker[];
    } catch (error) {
      console.error('Error fetching active bikers:', error);
      return [];
    }
  },
};
