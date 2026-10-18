import { Video, AdminUser, AdminStats, VideoFormData, VideoStatus, Plan, PlanFormData, PlanStatus } from '../types.ts';

const TOKEN_KEY = 'vortex_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, remember: boolean = true): void {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Constrói a URL completa para a requisição da API de forma segura.
 * Trata casos em que VITE_API_URL:
 * - Não foi definida (usa caminhos relativos '/')
 * - Termina com '/' (ex: 'https://api.meusite.com/')
 * - Termina com '/api' ou '/api/' (ex: 'https://api.meusite.com/api'), evitando duplicação '/api/api/...'
 * - Casos em que o endpoint não começa com barra (ex: 'api/auth/login')
 */
export function buildApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const rawBase = (import.meta.env.VITE_API_URL || '').trim();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (!rawBase) {
    return cleanEndpoint;
  }

  // Remove todas as barras finais da URL base
  const cleanBase = rawBase.replace(/\/+$/, '');

  // Se a base terminar com "/api" e o endpoint iniciar com "/api/", remove a duplicação
  if (cleanBase.toLowerCase().endsWith('/api') && cleanEndpoint.toLowerCase().startsWith('/api/')) {
    return `${cleanBase}${cleanEndpoint.substring(4)}`;
  }

  return `${cleanBase}${cleanEndpoint}`;
}

export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL || '').trim();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = buildApiUrl(endpoint);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const errorDetail = err instanceof Error ? err.message : String(err);
    const configuredApi = getApiBaseUrl();
    if (!configuredApi) {
      throw new Error(
        `Falha ao conectar com o backend. Como este site está no Netlify e VITE_API_URL não foi definida, o navegador tentou acessar o endpoint relativo '${url}'. Configure a variável de ambiente VITE_API_URL no Netlify apontando para o seu backend no Render ou Railway.`
      );
    }
    throw new Error(
      `Falha na conexão com a API em '${url}': ${errorDetail}. Verifique se o servidor backend no Render/Railway está online e aceita requisições.`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let data: any = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  // Se a rota retornou HTML (ex: Netlify fallback /* -> index.html com status 200/404) ou não-JSON
  if (!isJson || data === null) {
    const status = response.status;
    const configuredApi = getApiBaseUrl();

    if (!configuredApi) {
      throw new Error(
        `O backend Node.js não foi encontrado em produção (a requisição para '${url}' retornou resposta não-JSON, tipo '${contentType || 'HTML'}', status ${status}). O Netlify é um servidor estático que não roda Node.js. Para fazer login no painel administrativo, implante o backend (Render ou Railway) e defina a variável VITE_API_URL no Netlify apontando para ele.`
      );
    } else {
      throw new Error(
        `O servidor backend em '${configuredApi}' retornou uma resposta não-JSON para '${url}' (tipo '${contentType || 'HTML'}', status ${status}). Verifique se a URL do backend está correta e se a rota está ativa.`
      );
    }
  }

  if (!response.ok) {
    let errorMsg = data?.error;
    if (!errorMsg) {
      if (response.status === 404) {
        errorMsg = `Erro na requisição (404): Endpoint '${endpoint}' não encontrado.`;
      } else {
        errorMsg = `Erro na requisição (${response.status})`;
      }
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

// ----------------- AUTENTICAÇÃO -----------------

export async function loginApi(password: string): Promise<{ token: string; user: AdminUser }> {
  return request<{ token: string; user: AdminUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function logoutApi(): Promise<void> {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearAuthToken();
  }
}

export async function getMeApi(): Promise<{ user: AdminUser }> {
  return request<{ user: AdminUser }>('/api/auth/me');
}

// ----------------- CATÁLOGO PÚBLICO -----------------

export async function getPublicVideos(category?: string, search?: string): Promise<{ videos: Video[]; count: number }> {
  const params = new URLSearchParams();
  if (category && category !== 'Todas') params.append('category', category);
  if (search && search.trim()) params.append('search', search.trim());

  const query = params.toString() ? `?${params.toString()}` : '';
  return request<{ videos: Video[]; count: number }>(`/api/videos${query}`);
}

export async function getPublicCategories(): Promise<{ categories: string[] }> {
  return request<{ categories: string[] }>('/api/categories');
}

// ----------------- PAINEL ADMINISTRATIVO -----------------

export async function getAdminStats(): Promise<{ stats: AdminStats }> {
  return request<{ stats: AdminStats }>('/api/admin/stats');
}

export async function getAdminVideos(filters?: { search?: string; status?: string; category?: string }): Promise<{
  videos: Video[];
  count: number;
  categories: string[];
}> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.category && filters.category !== 'Todas') params.append('category', filters.category);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request<{ videos: Video[]; count: number; categories: string[] }>(`/api/admin/videos${query}`);
}

export async function getAdminVideo(id: string): Promise<{ video: Video }> {
  return request<{ video: Video }>(`/api/admin/videos/${id}`);
}

export async function createAdminVideo(data: VideoFormData): Promise<{ success: boolean; message: string; video: Video }> {
  return request<{ success: boolean; message: string; video: Video }>('/api/admin/videos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminVideo(id: string, data: VideoFormData): Promise<{ success: boolean; message: string; video: Video }> {
  return request<{ success: boolean; message: string; video: Video }>(`/api/admin/videos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateAdminVideoStatus(id: string, status: VideoStatus): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/admin/videos/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminVideo(id: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/admin/videos/${id}`, {
    method: 'DELETE',
  });
}

// ----------------- PLANOS DE ASSINATURA (ETAPA 2) -----------------

export async function getPublicPlans(): Promise<{ plans: Plan[]; count: number }> {
  return request<{ plans: Plan[]; count: number }>('/api/plans');
}

export async function getPublicPlan(id: string): Promise<{ plan: Plan }> {
  return request<{ plan: Plan }>(`/api/plans/${id}`);
}

export async function getAdminPlans(filters?: { search?: string; status?: string }): Promise<{
  plans: Plan[];
  count: number;
}> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request<{ plans: Plan[]; count: number }>(`/api/admin/plans${query}`);
}

export async function getAdminPlan(id: string): Promise<{ plan: Plan }> {
  return request<{ plan: Plan }>(`/api/admin/plans/${id}`);
}

export async function createAdminPlan(data: PlanFormData): Promise<{ success: boolean; message: string; plan: Plan }> {
  return request<{ success: boolean; message: string; plan: Plan }>('/api/admin/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminPlan(id: string, data: PlanFormData): Promise<{ success: boolean; message: string; plan: Plan }> {
  return request<{ success: boolean; message: string; plan: Plan }>(`/api/admin/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateAdminPlanStatus(id: string, status: PlanStatus): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/admin/plans/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminPlan(id: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/admin/plans/${id}`, {
    method: 'DELETE',
  });
}

