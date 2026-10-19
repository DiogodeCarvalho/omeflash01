import { User, Video, Plan, AdminMetrics, WebhookLog } from '../types';

let cachedToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('omeflash_token') : null;

export function setAuthToken(token: string | null) {
  cachedToken = token;
  if (token) {
    localStorage.setItem('omeflash_token', token);
  } else {
    localStorage.removeItem('omeflash_token');
  }
}

export function getAuthToken(): string | null {
  return cachedToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (cachedToken) {
    headers.set('Authorization', `Bearer ${cachedToken}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Erro ${response.status}: falha na requisição`;
    const err: any = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string):Promise<{ user: User; token: string; isVip: boolean }> {
    const res = await request<{ user: User; token: string; isVip: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string; isVip: boolean }> {
    const res = await request<{ user: User; token: string; isVip: boolean }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthToken(null);
  },

  async getMe(): Promise<{ user: User | null; isVip: boolean }> {
    return request<{ user: User | null; isVip: boolean }>('/api/auth/me');
  },

  // Videos
  async getVideos(): Promise<{ videos: Video[]; userHasVip: boolean }> {
    return request<{ videos: Video[]; userHasVip: boolean }>('/api/videos');
  },

  async getVideo(id: string): Promise<Video> {
    return request<Video>(`/api/videos/${id}`);
  },

  // Plans
  async getPlans(): Promise<Plan[]> {
    return request<Plan[]>('/api/plans');
  },

  // Stripe
  async getStripeConfig(): Promise<{ isConfigured: boolean; publishableKey: string; mode: string }> {
    return request<{ isConfigured: boolean; publishableKey: string; mode: string }>('/api/stripe/config');
  },

  async createCheckoutSession(planId: string): Promise<{ url: string; sessionId: string; mode: 'stripe' | 'simulation' }> {
    return request<{ url: string; sessionId: string; mode: 'stripe' | 'simulation' }>('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  async createPortalSession(): Promise<{ url: string }> {
    return request<{ url: string }>('/api/stripe/create-portal-session', {
      method: 'POST',
    });
  },

  async simulateCheckoutSuccess(planId: string, sessionId: string): Promise<{ success: boolean; user: User; isVip: boolean }> {
    return request<{ success: boolean; user: User; isVip: boolean }>('/api/stripe/simulate-checkout-success', {
      method: 'POST',
      body: JSON.stringify({ planId, sessionId }),
    });
  },

  async cancelSubscription(): Promise<{ success: boolean; message: string; user: User; isVip: boolean }> {
    return request<{ success: boolean; message: string; user: User; isVip: boolean }>('/api/stripe/cancel-subscription', {
      method: 'POST',
    });
  },

  async simulateWebhook(eventType: string, userEmail: string, planId?: string): Promise<any> {
    return request('/api/stripe/simulate-webhook', {
      method: 'POST',
      body: JSON.stringify({ eventType, userEmail, planId }),
    });
  },

  // Admin
  async getAdminMetrics(): Promise<AdminMetrics> {
    return request<AdminMetrics>('/api/admin/metrics');
  },

  async getAdminUsers(): Promise<User[]> {
    return request<User[]>('/api/admin/users');
  },

  async updateAdminUserSubscription(userId: string, data: { status: string; plan?: string | null; expiresAt?: string | null }): Promise<User> {
    return request<User>(`/api/admin/users/${userId}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async createVideo(videoData: Partial<Video>): Promise<Video> {
    return request<Video>('/api/admin/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  },

  async updateVideo(id: string, videoData: Partial<Video>): Promise<Video> {
    return request<Video>(`/api/admin/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(videoData),
    });
  },

  async deleteVideo(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/admin/videos/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminWebhooks(): Promise<WebhookLog[]> {
    return request<WebhookLog[]>('/api/admin/webhooks');
  },
};
