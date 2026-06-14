-- Database DDL for SQLite

-- Drop tables if they exist
DROP TABLE IF EXISTS lead_analysis;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
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

-- Lead Analysis qualification table
CREATE TABLE lead_analysis (
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
