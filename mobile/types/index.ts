export type Role = 'user' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceCents: number | null;
  stock: number;
  attributes: Record<string, string> | null;
  image: string | null;
  sortOrder: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  images: string[];
  vendorId: string;
  categoryId: string;
  stock: number;
  rating: number | null;
  attributes: Record<string, string>;
  variants: ProductVariant[];
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number | null;
  location: string;
  verified: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  qty: number;
  priceCents: number;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  qty: number;
  priceCents: number;
  name: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: OrderItem[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: Address;
  tracking?: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  last4: string;
  brand: string;
  expiry: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  isVerifiedPurchase: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface AppliedCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  discountCents: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
}
