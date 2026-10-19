export interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  isPremium: boolean;
  createdAt?: string;
  tags?: string[];
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string; // e.g. "mês", "ano", "trimestre"
  description: string;
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser;
  token: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  price: number;
  period: string;
  status: 'active' | 'canceled' | 'expired';
  paymentMethod: 'credit_card' | 'pix';
  cardLast4?: string;
  cardBrand?: string;
  startDate: string;
  nextBillingDate: string;
  canceledAt?: string;
  autoRenew: boolean;
}

export interface PaymentInvoice {
  id: string;
  subscriptionId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: 'credit_card' | 'pix';
  planName: string;
  period: string;
}

export interface SubscriberUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscription?: Subscription | null;
  invoices?: PaymentInvoice[];
}

export interface SubscriberAuthResponse {
  user: SubscriberUser;
  token: string;
  subscription?: Subscription | null;
}

export interface AdminStats {
  totalVideos: number;
  totalPlans: number;
  totalViews: number;
  premiumVideos: number;
  totalSubscribers?: number;
  activeSubscriptions?: number;
  mrr?: number;
}
