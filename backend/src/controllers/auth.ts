import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db';

export const seedAdminUser = async (): Promise<void> => {
  try {
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

    const secret = process.env.JWT_SECRET || 'quali_ai_secret_key_123456';
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      secret,
      { expiresIn: '24h' }
    );

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
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const db = await getDB();
    const existingUsers = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.run(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('[AUTH CONTROLLER] Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
