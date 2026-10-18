export type VideoStatus = 'published' | 'draft';
export type BillingInterval = 'month' | 'quarter' | 'semester' | 'year';
export type PlanStatus = 'active' | 'inactive';

export interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  duration: string;
  status: VideoStatus;
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price_in_cents: number;
  currency: string;
  billing_interval: BillingInterval;
  interval_count: number;
  benefits: string[];
  status: PlanStatus;
  is_featured: boolean;
  auto_renewal: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

export interface PlanFormData {
  name: string;
  description: string;
  price_in_cents: number;
  currency: string;
  billing_interval: BillingInterval;
  interval_count: number;
  benefits: string[];
  status: PlanStatus;
  is_featured: boolean;
  auto_renewal: boolean;
  sort_order: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminStats {
  total: number;
  published: number;
  drafts: number;
  categoriesCount: number;
  recentVideos: Array<{
    id: string;
    title: string;
    category: string;
    status: VideoStatus;
    created_at: string;
  }>;
  totalPlans?: number;
  activePlans?: number;
  inactivePlans?: number;
}

export interface VideoFormData {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  duration: string;
  status: VideoStatus;
}
