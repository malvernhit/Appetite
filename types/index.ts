export type UserMode = 'customer' | 'biker' | 'restaurant';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  user_mode: UserMode;
  created_at: string;
  updated_at: string;
}

export interface Biker {
  id: string;
  bike_plate: string;
  rating: number;
  total_deliveries: number;
  is_active: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  cuisine: string;
  rating: number;
  delivery_time: string;
  delivery_fee: number;
  min_order: number;
  is_open: boolean;
  image_url: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface FoodCategory {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  prep_time: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  price: number;
  notes: string;
}

export interface Order {
  id: string;
  customer_id: string;
  biker_id: string | null;
  restaurant_id: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
}

export interface DeliveryRequest {
  id: string;
  order_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}
