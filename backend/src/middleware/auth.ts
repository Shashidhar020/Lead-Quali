import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  const secret = process.env.JWT_SECRET || 'quali_ai_secret_key_123456';

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired auth token.' });
    }
    
    req.user = decoded as { id: number; name: string; email: string };
    next();
  });
};
