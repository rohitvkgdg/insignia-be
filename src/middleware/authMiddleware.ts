import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import logger from '../utils/logger';
import dotenv from 'dotenv';
dotenv.config();

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    // Get user from token
    const admin = await prisma.admins.findUnique({
      where: { id: decoded.id }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Add user info to request
    req.user = {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'admin' // Default to admin if no role specified
    };

    next();
  } catch (error) {
    logger.error(`Auth error: ${error}`);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check admin role permissions
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    
    next();
  };
};