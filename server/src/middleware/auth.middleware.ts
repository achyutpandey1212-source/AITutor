import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAuth } from '../config/firebase.js';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized: Missing or malformed Bearer token in Authorization header',
        code: 'AUTH_MISSING_TOKEN',
      },
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized: Empty token provided',
        code: 'AUTH_EMPTY_TOKEN',
      },
    });
    return;
  }

  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized: Invalid or expired token',
        code: 'AUTH_INVALID_TOKEN',
      },
    });
  }
};
