export type UserMode = 'customer' | 'biker';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: number;
  deliveryTime: string;
  image: string;
  isOpen: boolean;
}

export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface DeliveryRequest {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerAddress: string;
  pickupDistance: number;
  dropoffDistance: number;
  estimatedEarnings: number;
  items: CartItem[];
  status: 'pending' | 'accepted' | 'collecting' | 'delivering' | 'completed';
  timestamp: string;
}

export interface Biker {
  id: string;
  name: string;
  photo: string;
  bikePlate: string;
  rating: number;
}

export interface Order {
  id: string;
  restaurant: Restaurant;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'waiting' | 'accepted' | 'collecting' | 'delivering' | 'completed';
  biker?: Biker;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}
