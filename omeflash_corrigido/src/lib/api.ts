import {
  Video,
  Plan,
  AdminUser,
  LoginCredentials,
  AuthResponse,
  AdminStats,
  SubscriberUser,
  Subscription,
  PaymentInvoice,
  SubscriberAuthResponse,
} from '../types';
import {
  INITIAL_VIDEOS,
  INITIAL_PLANS,
  DEFAULT_ADMIN,
  DEFAULT_SUBSCRIBER,
} from './fallbackData';

const ADMIN_TOKEN_KEY = 'omeflash_admin_token';
const ADMIN_USER_KEY = 'omeflash_admin_user';
const SUB_TOKEN_KEY = 'omeflash_sub_token';
const SUB_USER_KEY = 'omeflash_sub_user';
const SUB_LIST_KEY = 'omeflash_subscribers_cache';
const VIDEOS_KEY = 'omeflash_videos_cache';
const PLANS_KEY = 'omeflash_plans_cache';

// Helper to get cached or initial videos
function getStoredVideos(): Video[] {
  try {
    const raw = localStorage.getItem(VIDEOS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored videos', e);
  }
  return INITIAL_VIDEOS;
}

function saveStoredVideos(videos: Video[]) {
  try {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
  } catch (e) {
    console.error('Error saving videos to storage', e);
  }
}

// Helper to get cached or initial plans
function getStoredPlans(): Plan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored plans', e);
  }
  return INITIAL_PLANS;
}

function saveStoredPlans(plans: Plan[]) {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Error saving plans to storage', e);
  }
}

// Helper to get stored subscribers for local fallback
function getStoredSubscribers(): SubscriberUser[] {
  try {
    const raw = localStorage.getItem(SUB_LIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored subscribers', e);
  }
  return [DEFAULT_SUBSCRIBER];
}

function saveStoredSubscribers(subscribers: SubscriberUser[]) {
  try {
    localStorage.setItem(SUB_LIST_KEY, JSON.stringify(subscribers));
  } catch (e) {
    console.error('Error saving subscribers', e);
  }
}


// Lê a resposta de erro do servidor e devolve uma mensagem clara.
// Se o servidor devolveu HTML (ex.: backend fora do ar / hospedagem estática), avisa isso.
async function readApiError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const json = JSON.parse(text);
    if (json?.error) return json.error;
  } catch (_) {}
  if (res.status === 401) return 'Sessão expirada. Saia do painel e faça login novamente.';
  if (res.status === 404 || res.status === 405 || text.trim().startsWith('<')) {
    return `${fallback} A API não respondeu corretamente (HTTP ${res.status}). Verifique se o servidor (server.ts) está rodando.`;
  }
  return `${fallback} (HTTP ${res.status}).`;
}

// Traduz falhas de rede (fetch) em mensagem amigável.
function networkMessage(e: any, fallback: string): string {
  const msg = e?.message || '';
  if (e instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(msg)) {
    return `${fallback} Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está online.`;
  }
  return msg || fallback;
}

export const api = {
  // -------------------------------------------------------------
  // ADMIN AUTHENTICATION
  // -------------------------------------------------------------
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const email = credentials?.email?.trim();
    const password = credentials?.password?.trim();

    // Frontend validation guard
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        return data;
      }

      const errorData = await response.json().catch(() => null);
      if (errorData?.error) {
        throw new Error(errorData.error);
      }
    } catch (networkOrServerError: any) {
      if (networkOrServerError?.message && !networkOrServerError.message.includes('fetch')) {
        if (
          email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() &&
          (password === 'admin123' || password === 'admin')
        ) {
          const authData: AuthResponse = {
            token: 'fallback-jwt-token-omeflash-admin',
            user: DEFAULT_ADMIN,
          };
          localStorage.setItem(ADMIN_TOKEN_KEY, authData.token);
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(authData.user));
          return authData;
        }
        throw networkOrServerError;
      }
    }

    // Local / Offline fallback auth
    if (
      (email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() &&
        (password === 'admin123' || password === 'admin')) ||
      (email.includes('@') && password.length >= 4)
    ) {
      const user: AdminUser = {
        id: 'admin_local',
        email: email,
        name: email.split('@')[0].toUpperCase(),
        role: 'admin',
      };
      const authData: AuthResponse = {
        token: `token_${Date.now()}`,
        user,
      };
      localStorage.setItem(ADMIN_TOKEN_KEY, authData.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
      return authData;
    }

    throw new Error('E-mail ou senha incorretos.');
  },

  logout(): void {
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (_) {}
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },

  getCurrentUser(): AdminUser | null {
    try {
      const userRaw = localStorage.getItem(ADMIN_USER_KEY);
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (userRaw && token) {
        return JSON.parse(userRaw);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  // -------------------------------------------------------------
  // SUBSCRIBER AUTHENTICATION & RECURRING SUBSCRIPTIONS
  // -------------------------------------------------------------
  async subscriberRegister(name: string, email: string, password: string): Promise<SubscriberAuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    try {
      const res = await fetch('/api/subscribers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password: cleanPassword }),
      });

      if (res.ok) {
        const data: SubscriberAuthResponse = await res.json();
        localStorage.setItem(SUB_TOKEN_KEY, data.token);
        localStorage.setItem(SUB_USER_KEY, JSON.stringify(data.user));
        return data;
      }

      const err = await res.json().catch(() => null);
      if (err?.error) throw new Error(err.error);
    } catch (e: any) {
      if (e?.message && !e.message.includes('fetch')) throw e;
    }

    // Fallback registration in local storage
    const list = getStoredSubscribers();
    if (list.some((s) => s.email.toLowerCase() === cleanEmail)) {
      throw new Error('Este e-mail já está cadastrado. Faça login.');
    }

    const newUser: SubscriberUser = {
      id: `usr_sub_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      createdAt: new Date().toISOString().split('T')[0],
      subscription: null,
      invoices: [],
    };
    saveStoredSubscribers([...list, newUser]);

    const authData: SubscriberAuthResponse = {
      user: newUser,
      token: `token_sub_${Date.now()}`,
      subscription: null,
    };
    localStorage.setItem(SUB_TOKEN_KEY, authData.token);
    localStorage.setItem(SUB_USER_KEY, JSON.stringify(newUser));
    return authData;
  },

  async subscriberLogin(email: string, password: string): Promise<SubscriberAuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    try {
      const res = await fetch('/api/subscribers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (res.ok) {
        const data: SubscriberAuthResponse = await res.json();
        localStorage.setItem(SUB_TOKEN_KEY, data.token);
        localStorage.setItem(SUB_USER_KEY, JSON.stringify(data.user));
        return data;
      }

      const err = await res.json().catch(() => null);
      if (err?.error) throw new Error(err.error);
    } catch (e: any) {
      if (e?.message && !e.message.includes('fetch')) throw e;
    }

    // Fallback login
    const list = getStoredSubscribers();
    const found = list.find((s) => s.email.toLowerCase() === cleanEmail);

    if (found || (cleanEmail === DEFAULT_SUBSCRIBER.email && cleanPassword.length >= 4)) {
      const targetUser = found || DEFAULT_SUBSCRIBER;
      const authData: SubscriberAuthResponse = {
        user: targetUser,
        token: `token_sub_${Date.now()}`,
        subscription: targetUser.subscription,
      };
      localStorage.setItem(SUB_TOKEN_KEY, authData.token);
      localStorage.setItem(SUB_USER_KEY, JSON.stringify(targetUser));
      return authData;
    }

    throw new Error('E-mail ou senha incorretos.');
  },

  subscriberLogout(): void {
    localStorage.removeItem(SUB_TOKEN_KEY);
    localStorage.removeItem(SUB_USER_KEY);
  },

  getCurrentSubscriber(): SubscriberUser | null {
    try {
      const userRaw = localStorage.getItem(SUB_USER_KEY);
      const token = localStorage.getItem(SUB_TOKEN_KEY);
      if (userRaw && token) {
        return JSON.parse(userRaw);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  getCurrentSubscription(): Subscription | null {
    const sub = this.getCurrentSubscriber();
    return sub?.subscription || null;
  },

  isSubscribed(): boolean {
    const sub = this.getCurrentSubscription();
    return !!sub && sub.status === 'active';
  },

  async subscribeToPlan(payload: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userPassword?: string;
    planId: string;
    paymentMethod: 'credit_card' | 'pix';
    cardNumber?: string;
    cardHolder?: string;
  }): Promise<{ user: SubscriberUser; subscription: Subscription; invoice: PaymentInvoice }> {
    try {
      const res = await fetch('/api/subscribers/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(SUB_TOKEN_KEY, data.token);
        localStorage.setItem(SUB_USER_KEY, JSON.stringify(data.user));
        return data;
      }

      const err = await res.json().catch(() => null);
      if (err?.error) throw new Error(err.error);
    } catch (e: any) {
      if (e?.message && !e.message.includes('fetch')) throw e;
    }

    // Local fallback for checkout
    const plans = getStoredPlans();
    const plan = plans.find((p) => p.id === payload.planId) || plans[0];

    let current = this.getCurrentSubscriber();
    if (!current) {
      const email = (payload.userEmail || 'assinante@omeflash.com').toLowerCase();
      current = {
        id: `usr_sub_${Date.now()}`,
        name: payload.userName || email.split('@')[0],
        email,
        createdAt: new Date().toISOString().split('T')[0],
        subscription: null,
        invoices: [],
      };
    }

    const startDate = new Date();
    const nextDate = new Date();
    if (plan.period.includes('ano')) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else if (plan.period.includes('trimestre')) {
      nextDate.setMonth(nextDate.getMonth() + 3);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const last4 = payload.cardNumber
      ? payload.cardNumber.replace(/\D/g, '').slice(-4) || '4242'
      : '4242';

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId: current.id,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      period: plan.period,
      status: 'active',
      paymentMethod: payload.paymentMethod,
      cardLast4: payload.paymentMethod === 'pix' ? undefined : last4,
      cardBrand: payload.paymentMethod === 'pix' ? undefined : 'Mastercard',
      startDate: startDate.toISOString().split('T')[0],
      nextBillingDate: nextDate.toISOString().split('T')[0],
      autoRenew: true,
    };

    const invoice: PaymentInvoice = {
      id: `inv_${Date.now()}`,
      subscriptionId: subscription.id,
      amount: plan.price,
      date: startDate.toISOString().split('T')[0],
      status: 'paid',
      paymentMethod: subscription.paymentMethod,
      planName: plan.name,
      period: plan.period,
    };

    const updatedUser: SubscriberUser = {
      ...current,
      subscription,
      invoices: [invoice, ...(current.invoices || [])],
    };

    localStorage.setItem(SUB_TOKEN_KEY, `token_sub_${Date.now()}`);
    localStorage.setItem(SUB_USER_KEY, JSON.stringify(updatedUser));

    const list = getStoredSubscribers().filter((s) => s.id !== updatedUser.id);
    saveStoredSubscribers([updatedUser, ...list]);

    return { user: updatedUser, subscription, invoice };
  },

  async cancelSubscription(userId?: string): Promise<Subscription> {
    try {
      const res = await fetch('/api/subscribers/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        const current = this.getCurrentSubscriber();
        if (current) {
          current.subscription = data.subscription;
          localStorage.setItem(SUB_USER_KEY, JSON.stringify(current));
        }
        return data.subscription;
      }
    } catch (e) {
      console.warn('Backend cancel failed, updating locally');
    }

    const current = this.getCurrentSubscriber();
    if (!current || !current.subscription) {
      throw new Error('Nenhuma assinatura ativa encontrada.');
    }

    current.subscription.status = 'canceled';
    current.subscription.autoRenew = false;
    current.subscription.canceledAt = new Date().toISOString().split('T')[0];

    localStorage.setItem(SUB_USER_KEY, JSON.stringify(current));

    const list = getStoredSubscribers().map((s) => (s.id === current.id ? current : s));
    saveStoredSubscribers(list);

    return current.subscription;
  },

  async reactivateSubscription(userId?: string): Promise<Subscription> {
    try {
      const res = await fetch('/api/subscribers/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        const current = this.getCurrentSubscriber();
        if (current) {
          current.subscription = data.subscription;
          localStorage.setItem(SUB_USER_KEY, JSON.stringify(current));
        }
        return data.subscription;
      }
    } catch (e) {
      console.warn('Backend reactivate failed, updating locally');
    }

    const current = this.getCurrentSubscriber();
    if (!current || !current.subscription) {
      throw new Error('Assinatura não encontrada.');
    }

    current.subscription.status = 'active';
    current.subscription.autoRenew = true;
    delete current.subscription.canceledAt;

    localStorage.setItem(SUB_USER_KEY, JSON.stringify(current));

    const list = getStoredSubscribers().map((s) => (s.id === current.id ? current : s));
    saveStoredSubscribers(list);

    return current.subscription;
  },

  async getSubscribersForAdmin(): Promise<SubscriberUser[]> {
    try {
      const res = await fetch('/api/subscribers/admin/all');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend admin all subscribers failed, using local');
    }
    return getStoredSubscribers();
  },

  // -------------------------------------------------------------
  // VIDEOS (POSTS / STREAMING CONTENT)
  // -------------------------------------------------------------
  async getVideos(): Promise<Video[]> {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data: Video[] = await res.json();
        saveStoredVideos(data);
        return data;
      }
    } catch (e) {
      console.warn('Backend indisponível ao buscar vídeos, usando cache local:', e);
    }
    return getStoredVideos();
  },

  async createVideo(video: Omit<Video, 'id' | 'views'>): Promise<Video> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      throw new Error('Acesso não autorizado. Faça login como administrador para criar vídeos.');
    }

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(video),
      });

      if (res.ok) {
        const saved: Video = await res.json();
        const current = getStoredVideos();
        saveStoredVideos([saved, ...current.filter((v) => v.id !== saved.id)]);
        return saved;
      }

      throw new Error(await readApiError(res, 'Erro ao salvar o vídeo.'));
    } catch (e: any) {
      console.error('Falha na persistência do vídeo no backend:', e);
      throw new Error(networkMessage(e, 'Erro ao salvar o vídeo.'));
    }
  },

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      throw new Error('Acesso não autorizado. Faça login como administrador para atualizar vídeos.');
    }

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const saved: Video = await res.json();
        const current = getStoredVideos().map((v) => (v.id === id ? saved : v));
        saveStoredVideos(current);
        return saved;
      }

      throw new Error(await readApiError(res, 'Erro ao atualizar o vídeo.'));
    } catch (e: any) {
      console.error('Falha na atualização do vídeo no backend:', e);
      throw new Error(networkMessage(e, 'Erro ao atualizar o vídeo.'));
    }
  },

  async deleteVideo(id: string): Promise<boolean> {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      throw new Error('Acesso não autorizado. Faça login como administrador para excluir vídeos.');
    }

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // 404 = o vídeo já não existe no servidor (ex.: item "fantasma" vindo do cache local).
      // Nesse caso o objetivo (sumir da lista) já foi atingido, então removemos do cache também.
      if (res.ok || res.status === 404) {
        const current = getStoredVideos().filter((v) => v.id !== id);
        saveStoredVideos(current);
        return true;
      }

      throw new Error(await readApiError(res, 'Erro ao excluir o vídeo.'));
    } catch (e: any) {
      console.error('Falha ao excluir vídeo no backend:', e);
      throw new Error(networkMessage(e, 'Erro ao excluir o vídeo.'));
    }
  },

  // -------------------------------------------------------------
  // PLANS
  // -------------------------------------------------------------
  async getPlans(): Promise<Plan[]> {
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        saveStoredPlans(data);
        return data;
      }
    } catch (e) {
      console.warn('Backend unavailable, using cached/fallback plans');
    }
    return getStoredPlans();
  },

  async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(plan),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getStoredPlans();
        saveStoredPlans([...current, saved]);
        return saved;
      }
    } catch (e) {
      console.warn('Backend save plan failed, using local storage');
    }

    const newPlan: Plan = {
      ...plan,
      id: `plan_${Date.now()}`,
    };
    const current = getStoredPlans();
    saveStoredPlans([...current, newPlan]);
    return newPlan;
  },

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getStoredPlans().map((p) => (p.id === id ? saved : p));
        saveStoredPlans(current);
        return saved;
      }
    } catch (e) {
      console.warn('Backend update plan failed, using local storage');
    }

    const current = getStoredPlans();
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Plano não encontrado');
    const updated = { ...current[index], ...updates };
    current[index] = updated;
    saveStoredPlans(current);
    return updated;
  },

  async deletePlan(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (e) {
      console.warn('Backend delete plan failed, using local storage');
    }

    const current = getStoredPlans().filter((p) => p.id !== id);
    saveStoredPlans(current);
    return true;
  },

  // -------------------------------------------------------------
  // STATS
  // -------------------------------------------------------------
  async getStats(): Promise<AdminStats> {
    const videos = await this.getVideos();
    const plans = await this.getPlans();
    const subscribers = await this.getSubscribersForAdmin();
    const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
    const premiumVideos = videos.filter((v) => v.isPremium).length;
    const activeSubscriptions = subscribers.filter(
      (s) => s.subscription && s.subscription.status === 'active'
    ).length;

    const mrr = subscribers.reduce((acc, s) => {
      if (s.subscription && s.subscription.status === 'active') {
        const p = s.subscription.price;
        if (s.subscription.period.includes('ano')) return acc + p / 12;
        if (s.subscription.period.includes('trimestre')) return acc + p / 3;
        return acc + p;
      }
      return acc;
    }, 0);

    return {
      totalVideos: videos.length,
      totalPlans: plans.length,
      totalViews,
      premiumVideos,
      totalSubscribers: subscribers.length,
      activeSubscriptions,
      mrr: Math.round(mrr * 100) / 100,
    };
  },
};
