-- Database DDL for PostgreSQL

-- Drop tables if they exist (Caution: clears all data)
DROP TABLE IF EXISTS lead_analysis;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
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

-- Lead Analysis qualification table
CREATE TABLE lead_analysis (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  lead_score INTEGER NOT NULL,
  business_type VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  buying_intent VARCHAR(50) NOT NULL,
  urgency_score INTEGER NOT NULL,
  follow_up_message TEXT NOT NULL
);
