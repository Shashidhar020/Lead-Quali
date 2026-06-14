import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db';

const signAuthToken = (user: { id: number; name: string; email: string }) => {
  const secret = process.env.JWT_SECRET || 'quali_ai_secret_key_123456';
  return jwt.sign(user, secret, { expiresIn: '24h' });
};

export const seedAdminUser = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
      console.log('[AUTH] Production mode detected. Demo admin seed is disabled.');
      return;
    }

    const db = await getDB();
    const users = await db.query('SELECT * FROM users LIMIT 1');

    if (users.length === 0) {
      console.log('[AUTH] No users found. Seeding default Admin user...');
      const name = 'Admin';
      const email = 'admin@quali.ai';
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);

      if (db.isPostgres()) {
        await db.run(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
          [name, email, hashedPassword]
        );
      } else {
        await db.run(
          'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
          [name, email, hashedPassword]
        );
      }
      console.log('[AUTH] Admin seeded successfully. Username: admin@quali.ai | Password: admin123');
    } else {
      console.log('[AUTH] Admin account checks passed.');
    }
  } catch (error) {
    console.error('[AUTH] Failed to verify/seed admin user account:', error);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const db = await getDB();
    const users = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signAuthToken({ id: user.id, name: user.name, email: user.email });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[AUTH CONTROLLER] Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  try {
    const db = await getDB();
    const existingUsers = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) ${db.isPostgres() ? 'RETURNING id' : ''}`,
      [name, email, hashedPassword]
    );

    const userId = Number(result.lastID);
    const user = { id: userId, name, email };
    const token = signAuthToken(user);

    return res.status(201).json({ message: 'User registered successfully', token, user });
  } catch (error) {
    console.error('[AUTH CONTROLLER] Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response) => {
  const authUser = (req as any).user;

  if (!authUser?.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const db = await getDB();
    const users = await db.query('SELECT id, name, email FROM users WHERE id = $1', [authUser.id]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    return res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error('[AUTH CONTROLLER] Me error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
