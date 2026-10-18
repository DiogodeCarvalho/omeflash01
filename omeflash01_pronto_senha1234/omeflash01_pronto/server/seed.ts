import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { db, initDatabase } from './db.ts';
import { hashPassword, verifyPassword } from './auth.ts';

dotenv.config();

export function seedAdmin(forceReset = false) {
  initDatabase();

  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@vortexstream.com').trim().toLowerCase();
  const adminPassword = '1234'; // Senha fixa do administrador (login apenas com senha)
  const adminName = process.env.ADMIN_INITIAL_NAME || 'Administrador Geral';
  const now = new Date().toISOString();

  const checkStmt = db.prepare("SELECT id, email, password_hash, salt FROM users WHERE role = 'admin'");
  const existingAdmin = checkStmt.get() as { id: number; email: string; password_hash: string; salt: string } | undefined;

  if (existingAdmin && !forceReset) {
    // Garante que a senha do admin existente seja sempre 1234
    if (!verifyPassword(adminPassword, existingAdmin.password_hash, existingAdmin.salt)) {
      const { hash, salt } = hashPassword(adminPassword);
      db.prepare('UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?').run(hash, salt, now, existingAdmin.id);
      console.log('[Seed] Senha do administrador atualizada.');
    }
    console.log(`[Seed] Administrador já existente no banco de dados (${existingAdmin.email}).`);
  } else {
    const { hash, salt } = hashPassword(adminPassword);
    const uuid = crypto.randomUUID();

    if (existingAdmin && forceReset) {
      const updateStmt = db.prepare(`
        UPDATE users 
        SET name = ?, email = ?, password_hash = ?, salt = ?, updated_at = ? 
        WHERE id = ?
      `);
      updateStmt.run(adminName, adminEmail, hash, salt, now, existingAdmin.id);
      console.log(`[Seed] Administrador padrão atualizado com sucesso (${adminEmail}).`);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO users (uuid, name, email, password_hash, salt, role, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, 'admin', ?, ?)
      `);
      insertStmt.run(uuid, adminName, adminEmail, hash, salt, now, now);
      console.log(`[Seed] Primeiro administrador criado com sucesso!`);
      console.log(`[Seed] E-mail: ${adminEmail}`);
    }
  }

  // Se a tabela de vídeos estiver vazia, adiciona dados de demonstração iniciais claramente identificados
  const videoCountStmt = db.prepare('SELECT COUNT(*) as count FROM videos');
  const videoCount = (videoCountStmt.get() as { count: number }).count;

  if (videoCount === 0) {
    console.log('[Seed] Inserindo vídeos de exemplo demonstrativo...');
    const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail) as { id: number };

    const sampleVideos = [
      {
        id: crypto.randomUUID(),
        title: 'Explorando o Cosmos: A Origem das Galáxias',
        description: '[Exemplo Demonstrativo] Uma jornada visual cinematográfica pelos mistérios do universo profundo e as primeiras estruturas cósmicas.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        category: 'Documentário',
        duration: '09:56',
        status: 'published',
      },
      {
        id: crypto.randomUUID(),
        title: 'Arquitetura de Alta Performance no Backend Moderno',
        description: '[Exemplo Demonstrativo] Padrões de microsserviços, cache distribuído e boas práticas para sistemas de escala mundial.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        category: 'Tecnologia',
        duration: '14:22',
        status: 'published',
      },
      {
        id: crypto.randomUUID(),
        title: 'Cinematografia Digital: O Poder da Iluminação Natural',
        description: '[Exemplo Demonstrativo] Guia prático de direção de fotografia com dicas sobre temperatura de cor, lentes e composição de quadros.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
        category: 'Cinema',
        duration: '18:40',
        status: 'published',
      },
      {
        id: crypto.randomUUID(),
        title: 'Segredos da Produção de Áudio Imersivo (Em Breve)',
        description: '[Exemplo Demonstrativo] Gravação em rascunho para demonstrar o recurso de status não publicado no painel de controle.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
        category: 'Áudio',
        duration: '22:15',
        status: 'draft',
      },
    ];

    const insertVideoStmt = db.prepare(`
      INSERT INTO videos (
        id, title, description, video_url, thumbnail_url, category, duration, status, created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const v of sampleVideos) {
      insertVideoStmt.run(
        v.id,
        v.title,
        v.description,
        v.video_url,
        v.thumbnail_url,
        v.category,
        v.duration,
        v.status,
        now,
        now,
        adminUser?.id || null
      );
    }
    console.log('[Seed] 4 vídeos de demonstração inseridos.');
  }

  // Se a tabela de planos estiver vazia, adiciona planos iniciais de demonstração
  const planCountStmt = db.prepare('SELECT COUNT(*) as count FROM plans');
  const planCount = (planCountStmt.get() as { count: number }).count;

  if (planCount === 0) {
    console.log('[Seed] Inserindo planos de assinatura de exemplo demonstrativo...');
    const adminUser = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail) as { id: number } | undefined;

    const samplePlans = [
      {
        id: crypto.randomUUID(),
        name: 'Plano Básico Mensal',
        description: 'Ideal para quem busca acesso rápido e flexível sem fidelidade a longo prazo.',
        price_in_cents: 2490, // R$ 24,90
        currency: 'BRL',
        billing_interval: 'month',
        interval_count: 1,
        benefits: JSON.stringify([
          'Acesso ilimitado ao catálogo de vídeos',
          'Qualidade de transmissão Full HD (1080p)',
          'Assista em até 2 telas simultâneas',
          'Experiência 100% sem anúncios',
          'Cancelamento facilitado a qualquer momento'
        ]),
        status: 'active',
        is_featured: 0,
        auto_renewal: 1,
        sort_order: 1,
      },
      {
        id: crypto.randomUUID(),
        name: 'Plano Pro Trimestral',
        description: 'Nosso plano mais popular: equilíbrio perfeito entre economia e recursos premium.',
        price_in_cents: 6490, // R$ 64,90 (equivale a R$ 21,63/mês)
        currency: 'BRL',
        billing_interval: 'quarter',
        interval_count: 1,
        benefits: JSON.stringify([
          'Acesso completo a todas as produções originais',
          'Qualidade 4K Ultra HD + HDR',
          'Até 3 telas simultâneas com perfis individuais',
          'Downloads liberados para visualização offline',
          'Suporte prioritário ao assinante',
          'Desconto exclusivo no ciclo trimestral'
        ]),
        status: 'active',
        is_featured: 1, // RECOMENDADO / DESTAQUE
        auto_renewal: 1,
        sort_order: 2,
      },
      {
        id: crypto.randomUUID(),
        name: 'Plano Premium Anual',
        description: 'A experiência definitiva com a maior economia do ano (mais de 30% off).',
        price_in_cents: 19990, // R$ 199,90 (equivale a R$ 16,65/mês)
        currency: 'BRL',
        billing_interval: 'year',
        interval_count: 1,
        benefits: JSON.stringify([
          'Passe VIP com acesso irrestrito a todos os lançamentos',
          'Resolução máxima 4K + Áudio imersivo espacial',
          'Até 5 telas simultâneas',
          'Downloads ilimitados em qualquer dispositivo',
          'Acesso antecipado a pré-estreias e bastidores',
          'Mais de 30% de economia comparado ao plano mensal'
        ]),
        status: 'active',
        is_featured: 0,
        auto_renewal: 1,
        sort_order: 3,
      },
      {
        id: crypto.randomUUID(),
        name: 'Plano Corporativo / Eventos',
        description: 'Licença sob demanda para exibição pública e equipes empresariais.',
        price_in_cents: 49990, // R$ 499,90
        currency: 'BRL',
        billing_interval: 'semester',
        interval_count: 1,
        benefits: JSON.stringify([
          'Licença multiusuário para até 20 acessos',
          'Painel de métricas de engajamento da equipe',
          'Gerente de contas dedicado'
        ]),
        status: 'inactive', // DESATIVADO intencionalmente para teste de regras comerciais
        is_featured: 0,
        auto_renewal: 0,
        sort_order: 4,
      },
    ];

    const insertPlanStmt = db.prepare(`
      INSERT INTO plans (
        id, name, description, price_in_cents, currency, billing_interval, interval_count, benefits, status, is_featured, auto_renewal, sort_order, created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of samplePlans) {
      insertPlanStmt.run(
        p.id,
        p.name,
        p.description,
        p.price_in_cents,
        p.currency,
        p.billing_interval,
        p.interval_count,
        p.benefits,
        p.status,
        p.is_featured,
        p.auto_renewal,
        p.sort_order,
        now,
        now,
        adminUser?.id || null
      );
    }
    console.log('[Seed] 4 planos de assinatura de demonstração inseridos.');
  }
}

// Execução direta via CLI (npm run seed:admin)
const isDirectRun = process.argv[1]?.includes('seed.ts');
if (isDirectRun) {
  const force = process.argv.includes('--force');
  seedAdmin(force);
  console.log('[Seed] Processo concluído.');
  process.exit(0);
}
