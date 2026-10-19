import fs from 'fs';
import path from 'path';
import { Video, Plan, AdminUser, SubscriberUser } from '../src/types';
import { INITIAL_VIDEOS, INITIAL_PLANS, DEFAULT_ADMIN, DEFAULT_SUBSCRIBER } from '../src/lib/fallbackData';

export interface Database {
  users: (AdminUser & { passwordHash: string })[];
  subscribers: (SubscriberUser & { passwordHash: string })[];
  videos: Video[];
  plans: Plan[];
}

// Persistent storage path
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Default initial state
function getDefaultDb(): Database {
  return {
    users: [
      {
        ...DEFAULT_ADMIN,
        passwordHash: 'admin123',
      },
    ],
    subscribers: [
      {
        ...DEFAULT_SUBSCRIBER,
        passwordHash: 'senha123',
      },
    ],
    videos: [...INITIAL_VIDEOS],
    plans: [...INITIAL_PLANS],
  };
}

// Load database from disk or initialize
function loadDb(): Database {
  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content) as Database;

      // Validate structure integrity
      if (Array.isArray(parsed.videos) && Array.isArray(parsed.plans) && Array.isArray(parsed.users)) {
        return {
          users: parsed.users || [],
          subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [{ ...DEFAULT_SUBSCRIBER, passwordHash: 'senha123' }],
          videos: parsed.videos,
          plans: parsed.plans,
        };
      }
    } catch (err) {
      console.error('Error reading db.json, reinitializing from defaults:', err);
    }
  }

  // If file doesn't exist or was corrupt, create default
  const defaultData = getDefaultDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write initial db.json:', err);
  }
  return defaultData;
}

// In-memory reference initialized from disk
export const db: Database = loadDb();

// Persist current state to disk
export function saveDb(): boolean {
  try {
    ensureDataDir();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('CRITICAL: Failed to persist database to disk:', err);
    try {
      // Fallback direct write
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      return true;
    } catch (directErr) {
      console.error('CRITICAL: Direct write also failed:', directErr);
      return false;
    }
  }
}
