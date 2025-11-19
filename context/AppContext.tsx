import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserMode, CartItem, Order, DeliveryRequest } from '@/types';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export type Theme = 'light' | 'dark';

interface AppContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (dishId: string) => void;
  clearCart: () => void;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  activeDelivery: DeliveryRequest | null;
  setActiveDelivery: (delivery: DeliveryRequest | null) => void;
  theme: Theme;
  toggleTheme: () => void;
  hasSeenCoachMark: boolean;
  dismissCoachMark: () => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const COACH_MARK_KEY = '@coach_mark_seen';

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userMode, setUserMode] = useState<UserMode>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<DeliveryRequest | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [hasSeenCoachMark, setHasSeenCoachMark] = useState(true);

  useEffect(() => {
    checkCoachMarkStatus();
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchUserMode(currentSession.user.id);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            await fetchUserMode(newSession.user.id);
          } else {
            setUserMode('customer');
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserMode = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_mode')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data?.user_mode) {
        setUserMode(data.user_mode as UserMode);
      }
    } catch (error) {
      console.error('Error fetching user mode:', error);
    }
  };

  const checkCoachMarkStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(COACH_MARK_KEY);
      setHasSeenCoachMark(value === 'true');
    } catch (error) {
      console.error('Error checking coach mark status:', error);
    }
  };

  const dismissCoachMark = async () => {
    try {
      await AsyncStorage.setItem(COACH_MARK_KEY, 'true');
      setHasSeenCoachMark(true);
    } catch (error) {
      console.error('Error saving coach mark status:', error);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.dish.id === item.dish.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCart([]);
      setCurrentOrder(null);
      setActiveDelivery(null);
      setUserMode('customer');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        session,
        user,
        isLoading,
        userMode,
        setUserMode,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        currentOrder,
        setCurrentOrder,
        activeDelivery,
        setActiveDelivery,
        theme,
        toggleTheme,
        hasSeenCoachMark,
        dismissCoachMark,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
