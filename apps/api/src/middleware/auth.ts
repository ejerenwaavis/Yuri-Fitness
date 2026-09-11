import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_yuri_fitness'
    ) as any;

    const userId = decoded.userId || decoded.id;
    
    // Fetch user from DB to ensure freshest role and validity
    const dbUser = await UserModel.findById(userId);
    if (!dbUser) {
      res.status(401).json({ error: 'Unauthorized: User not found' });
      return;
    }

    req.user = {
      id: dbUser._id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: (dbUser.role as 'user' | 'admin') || 'user'
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: Request, 
  _res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_yuri_fitness'
    ) as any;
    const userId = decoded.userId || decoded.id;
    const dbUser = await UserModel.findById(userId);
    if (dbUser) {
      req.user = {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name,
        role: (dbUser.role as 'user' | 'admin') || 'user'
      };
    }
  } catch {
    // Ignore invalid token in optionalAuth
  }
  next();
};

export const requireAdmin = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required to perform this action' });
    return;
  }

  next();
};
