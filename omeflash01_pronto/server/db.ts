import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Diretório do banco SQLite. No Render, aponte DATA_DIR para o ponto de montagem de um Disk
// persistente (ex.: /var/data); sem isso o banco é perdido a cada deploy/reinício.
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'platform.db');
export const db = new DatabaseSync(dbPath);

// Ativa chaves estrangeiras e modo WAL para integridade e performance
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Inicialização das tabelas relacionais do banco de dados
 */
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('published', 'draft')) DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_in_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BRL',
      billing_interval TEXT NOT NULL CHECK(billing_interval IN ('month', 'quarter', 'semester', 'year')),
      interval_count INTEGER NOT NULL DEFAULT 1,
      benefits TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      is_featured INTEGER NOT NULL DEFAULT 0,
      auto_renewal INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
    CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
    CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
    CREATE INDEX IF NOT EXISTS idx_plans_sort_order ON plans(sort_order ASC);
  `);
}
