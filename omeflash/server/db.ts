import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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
  videoUrl: string;
  duration: string;
  category: string;
  tags: string[];
  isVip: boolean;
  views: number;
  likes: number;
  featured?: boolean;
  createdAt: string;
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

export interface DatabaseSchema {
  users: User[];
  videos: Video[];
  plans: Plan[];
  webhookLogs: WebhookLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'omeflash.json');

// Real, stable, high quality MP4 videos from verified open video sources (Big Buck Bunny, Tears of Steel, Elephants Dream, etc. for reliable streaming)
const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'Encontro Às Cegas #42: Conexão Inesperada e Revelações',
    description: 'Dois completos estranhos conversam por 30 minutos sem filtro. O que começou tímido se transformou em uma das conversas mais surpreendentes da temporada.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_960x540.mp4',
    duration: '18:24',
    category: 'Conversas Marcantes',
    tags: ['Romance', 'Primeiro Encontro', 'Emocionante'],
    isVip: true,
    views: 14230,
    likes: 1240,
    featured: true,
    createdAt: '2026-09-15T14:30:00Z',
  },
  {
    id: 'vid-2',
    title: 'Degustação: 5 Minutos Que Mudaram Tudo',
    description: 'Vídeo gratuito de apresentação. Veja como acontecem os encontros espontâneos dentro da plataforma OmeFlash.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
    duration: '05:12',
    category: 'Destaques',
    tags: ['Grátis', 'Degustação', 'Espontâneo'],
    isVip: false,
    views: 38400,
    likes: 3120,
    featured: false,
    createdAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'vid-3',
    title: 'VIP Exclusivo: O Segredo de Pedro e Mariana',
    description: 'Eles descobriram que moravam no mesmo quarteirão há 10 anos e nunca tinham se visto antes dessa chamada.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4',
    duration: '24:10',
    category: 'Encontros VIP',
    tags: ['VIP', 'Coincidência', 'História Real'],
    isVip: true,
    views: 9820,
    likes: 890,
    featured: true,
    createdAt: '2026-09-22T18:15:00Z',
  },
  {
    id: 'vid-4',
    title: 'Flagras Divertidos: Quando a Internet Cai na Melhor Parte',
    description: 'Compilado dos momentos mais engraçados e gafes hilárias que rolaram nas gravações ao vivo.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
    duration: '12:05',
    category: 'Flagras Divertidos',
    tags: ['Comédia', 'Gafes', 'Ao Vivo'],
    isVip: true,
    views: 22100,
    likes: 2450,
    featured: false,
    createdAt: '2026-10-01T20:00:00Z',
  },
  {
    id: 'vid-5',
    title: 'Madrugada OmeFlash: Conversas Profundas Sem Julgamentos',
    description: 'Às 3 da manhã as máscaras caem. Uma conversa intimista sobre sonhos, medos e recomeços entre dois estranhos da noite.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_960x540.mp4',
    duration: '31:40',
    category: 'Conversas Marcantes',
    tags: ['Madrugada', 'Profundo', 'Reflexão'],
    isVip: true,
    views: 17400,
    likes: 1980,
    featured: false,
    createdAt: '2026-10-05T03:10:00Z',
  },
  {
    id: 'vid-6',
    title: 'Encontro Musical: Dueto Improvisado ao Vivo',
    description: 'Um violão em São Paulo e uma voz no Rio de Janeiro. Uma harmonia que ninguém planejou.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4',
    duration: '15:50',
    category: 'Encontros VIP',
    tags: ['Música', 'Improviso', 'Arte'],
    isVip: true,
    views: 28900,
    likes: 3670,
    featured: true,
    createdAt: '2026-10-10T16:45:00Z',
  }
];

const INITIAL_PLANS: Plan[] = [
  {
    id: 'vip_monthly',
    name: 'VIP Mensal',
    price: 29.90,
    currency: 'BRL',
    interval: 'month',
    periodLabel: 'mês',
    description: 'Ideal para experimentar o catálogo completo com flexibilidade.',
    features: [
      'Acesso ilimitado a todos os vídeos VIP',
      'Novos episódios toda semana',
      'Qualidade Full HD e áudio de alta fidelidade',
      'Assista no celular, tablet e computador',
      'Cancele a qualquer momento sem taxas'
    ],
    highlight: false,
    stripePriceId: process.env.STRIPE_PRICE_MONTHLY || 'price_vip_monthly_default'
  },
  {
    id: 'vip_quarterly',
    name: 'VIP Trimestral',
    price: 69.90,
    currency: 'BRL',
    interval: 'quarter',
    periodLabel: '3 meses',
    badge: 'Economize 22%',
    description: 'O melhor custo-benefício para quem acompanha as gravações regulares.',
    features: [
      'Tudo do Plano Mensal',
      'Economia de R$ 19,80 no período',
      'Acesso antecipado aos novos lançamentos',
      'Comentários e reações exclusivas',
      'Renovação automática trimestral'
    ],
    highlight: true,
    stripePriceId: 'price_vip_quarterly_default'
  },
  {
    id: 'vip_annual',
    name: 'VIP Anual',
    price: 199.90,
    currency: 'BRL',
    interval: 'year',
    periodLabel: 'ano',
    badge: 'Melhor Valor (44% OFF)',
    description: 'Acesso VIP irrestrito por 1 ano completo ao menor custo mensal.',
    features: [
      'Acesso VIP total por 12 meses',
      'Equivale a apenas R$ 16,65 por mês',
      'Acesso a gravações sem censura e extras de bastidores',
      'Badge VIP no perfil e prioridade em novas funcionalidades',
      'Suporte prioritário via WhatsApp'
    ],
    highlight: false,
    stripePriceId: process.env.STRIPE_PRICE_ANNUAL || 'price_vip_annual_default'
  }
];

function seedDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const vipPasswordHash = bcrypt.hashSync('vip123', salt);
  const userPasswordHash = bcrypt.hashSync('user123', salt);

  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 1);

  const initialUsers: User[] = [
    {
      id: 'usr-admin',
      name: 'Administrador OmeFlash',
      email: 'admin@omeflash.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      subscriptionStatus: 'active',
      subscriptionPlan: 'vip_annual',
      subscriptionExpiresAt: '2028-12-31T23:59:59Z',
      stripeCustomerId: 'cus_admin_demo',
      stripeSubscriptionId: 'sub_admin_demo',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr-vip',
      name: 'Lucas Silva (Assinante VIP)',
      email: 'vip@omeflash.com',
      passwordHash: vipPasswordHash,
      role: 'user',
      subscriptionStatus: 'active',
      subscriptionPlan: 'vip_monthly',
      subscriptionExpiresAt: futureDate.toISOString(),
      stripeCustomerId: 'cus_demo_vip123',
      stripeSubscriptionId: 'sub_demo_vip123',
      createdAt: '2026-08-10T12:00:00Z',
    },
    {
      id: 'usr-free',
      name: 'Mariana Costa (Sem Assinatura)',
      email: 'user@omeflash.com',
      passwordHash: userPasswordHash,
      role: 'user',
      subscriptionStatus: 'none',
      subscriptionPlan: null,
      subscriptionExpiresAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: '2026-09-01T09:30:00Z',
    }
  ];

  return {
    users: initialUsers,
    videos: INITIAL_VIDEOS,
    plans: INITIAL_PLANS,
    webhookLogs: [
      {
        id: 'log-seed-1',
        event: 'system.initialization',
        status: 'success',
        message: 'Banco de dados OmeFlash inicializado com catálogo de vídeos e contas de demonstração.',
        receivedAt: new Date().toISOString()
      }
    ]
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.videos)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar banco de dados, inicializando novo:', e);
    }
    const fresh = seedDatabase();
    this.saveDirect(fresh);
    return fresh;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erro ao salvar banco de dados OmeFlash:', e);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  // User queries
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByStripeCustomerId(customerId: string): User | undefined {
    return this.data.users.find(u => u.stripeCustomerId === customerId);
  }

  public getUserByStripeSubscriptionId(subscriptionId: string): User | undefined {
    return this.data.users.find(u => u.stripeSubscriptionId === subscriptionId);
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Videos queries
  public getVideos(): Video[] {
    return this.data.videos;
  }

  public getVideoById(id: string): Video | undefined {
    return this.data.videos.find(v => v.id === id);
  }

  public addVideo(video: Video): Video {
    this.data.videos.unshift(video);
    this.save();
    return video;
  }

  public updateVideo(id: string, updates: Partial<Video>): Video | undefined {
    const idx = this.data.videos.findIndex(v => v.id === id);
    if (idx === -1) return undefined;
    this.data.videos[idx] = { ...this.data.videos[idx], ...updates };
    this.save();
    return this.data.videos[idx];
  }

  public deleteVideo(id: string): boolean {
    const prevLen = this.data.videos.length;
    this.data.videos = this.data.videos.filter(v => v.id !== id);
    if (this.data.videos.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Plans queries
  public getPlans(): Plan[] {
    return this.data.plans;
  }

  public getPlanById(id: string): Plan | undefined {
    return this.data.plans.find(p => p.id === id);
  }

  // Webhook Logs
  public getWebhookLogs(): WebhookLog[] {
    return this.data.webhookLogs || [];
  }

  public addWebhookLog(log: Omit<WebhookLog, 'id' | 'receivedAt'>): WebhookLog {
    const newLog: WebhookLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      receivedAt: new Date().toISOString()
    };
    if (!this.data.webhookLogs) this.data.webhookLogs = [];
    this.data.webhookLogs.unshift(newLog);
    // keep latest 50 logs
    if (this.data.webhookLogs.length > 50) {
      this.data.webhookLogs = this.data.webhookLogs.slice(0, 50);
    }
    this.save();
    return newLog;
  }
}

export const db = new Database();
