// src/app/models/index.ts

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  profileImageUrl: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  iconClass: string;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  imageUrl: string;
  imageUrls: string[];
  brand: string;
  categoryId: number;
  categoryName: string;
  sellerId: number;
  sellerName: string;
  averageRating: number;
  ratingCount: number;
  active: boolean;
  lowStockThreshold: number;
  lowStock: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
  sellerId: number;
}

export interface Cart {
  id: number;
  buyerId: number;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  productPrice: number;
  addedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
  sellerId: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  buyerId: number;
  buyerEmail: string;
  buyerName: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderRequest {
  items: {
    productId: number;
    productName: string;
    imageUrl: string;
    price: number;
    quantity: number;
    sellerId: number;
  }[];
  shippingAddress: string;
  paymentMethod: string;
  paymentId?: string;
}

export interface Payment {
  id: number;
  paymentId: string;
  orderId: number;
  orderNumber: string;
  buyerId: number;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  transactionId: string;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  buyerId: number;
  buyerName: string;
  comment: string;
  createdAt: string;
}

export interface SellerStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}
