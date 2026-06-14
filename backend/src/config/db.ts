import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

export interface DB {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  run(sql: string, params?: any[]): Promise<{ lastID?: number | string }>;
  isPostgres(): boolean;
}

let dbInstance: DB;

const pgSchema = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  business_requirement TEXT NOT NULL,
  budget VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS lead_analysis (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  lead_score INTEGER NOT NULL,
  business_type VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  buying_intent VARCHAR(50) NOT NULL,
  urgency_score INTEGER NOT NULL,
  follow_up_message TEXT NOT NULL
);
`;

const sqliteSchema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  business_requirement TEXT NOT NULL,
  budget TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS lead_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER UNIQUE,
  lead_score INTEGER NOT NULL,
  business_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  buying_intent TEXT NOT NULL,
  urgency_score INTEGER NOT NULL,
  follow_up_message TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
);
`;

export const getDB = async (): Promise<DB> => {
  if (dbInstance) return dbInstance;

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.startsWith('postgres')) {
    console.log('[DATABASE] Initializing PostgreSQL Connection Pool...');
    const pool = new Pool({ connectionString: dbUrl });
    
    // Auto-migrate tables
    try {
      await pool.query(pgSchema);
      console.log('[DATABASE] PostgreSQL Tables Checked/Created.');
    } catch (err) {
      console.error('[DATABASE] Error running Postgres migrations:', err);
    }

    dbInstance = {
      isPostgres: () => true,
      query: async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
        const result = await pool.query(sql, params);
        return result.rows;
      },
      run: async (sql: string, params?: any[]): Promise<{ lastID?: number | string }> => {
        // For Postgres INSERT... RETURNING id is standard, otherwise we execute query
        const result = await pool.query(sql, params);
        const lastID = result.rows[0]?.id;
        return { lastID };
      }
    };
  } else {
    console.log('[DATABASE] DATABASE_URL missing or empty. Initializing local SQLite database...');
    const sqlitePath = path.resolve(__dirname, '../../../database.sqlite');
    
    const sqliteDb = new sqlite3.Database(sqlitePath);

    // Run migrations synchronously on startup
    await new Promise<void>((resolve, reject) => {
      sqliteDb.exec(sqliteSchema, (err) => {
        if (err) {
          console.error('[DATABASE] Error initializing SQLite tables:', err);
          reject(err);
        } else {
          console.log('[DATABASE] SQLite Tables Checked/Created at:', sqlitePath);
          resolve();
        }
      });
    });

    dbInstance = {
      isPostgres: () => false,
      query: <T = any>(sql: string, params?: any[]): Promise<T[]> => {
        // Convert Postgres $1, $2 to SQLite ? placeholders
        const sqliteSql = sql.replace(/\$[0-9]+/g, '?');
        return new Promise((resolve, reject) => {
          sqliteDb.all(sqliteSql, params || [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
          });
        });
      },
      run: (sql: string, params?: any[]): Promise<{ lastID?: number | string }> => {
        const sqliteSql = sql.replace(/\$[0-9]+/g, '?');
        return new Promise((resolve, reject) => {
          sqliteDb.run(sqliteSql, params || [], function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID });
          });
        });
      }
    };
  }

  return dbInstance;
};
