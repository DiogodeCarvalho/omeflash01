export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  subscriptionStatus: 'none' | 'active' | 'canceled' | 'past_due';
  subscriptionPlan: 'vip_monthly' | 'vip_quarterly' | 'vip_annual' | null;
  subscriptionExpiresAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  tags: string[];
  isVip: boolean;
  views: number;
  likes: number;
  featured?: boolean;
  createdAt: string;
  canAccess: boolean;
  streamUrl: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'quarter' | 'year';
  periodLabel: string;
  badge?: string;
  highlight?: boolean;
  description: string;
  features: string[];
  stripePriceId?: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  status: 'success' | 'failed' | 'ignored';
  message: string;
  payloadSummary?: string;
  receivedAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeSubscribers: number;
  totalVideos: number;
  vipVideosCount: number;
  estimatedMrr: number;
  webhookLogsCount: number;
}
