import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, User } from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { UserModel } from '../models/user.model.js';

export const authRouter = Router();

authRouter.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<User>>): Promise<void> => {
    try {
      const decodedUser = req.user;
      if (!decodedUser || !decodedUser.uid) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Unauthorized: No verified user identity found on request',
            code: 'AUTH_NO_IDENTITY',
          },
        });
        return;
      }

      const firebaseUid = decodedUser.uid;
      const email = decodedUser.email || '';
      const displayName = decodedUser.name || '';
      const photoURL = decodedUser.picture || '';

      // Find or synchronize MongoDB User document
      let userDoc = await UserModel.findOne({ firebaseUid });

      if (!userDoc) {
        userDoc = await UserModel.create({
          firebaseUid,
          email,
          displayName,
          photoURL,
        });
        console.log(`👤 Created new MongoDB user for Firebase UID: ${firebaseUid}`);
      } else {
        // Optionally keep email/name in sync if changed
        let modified = false;
        if (email && userDoc.email !== email) {
          userDoc.email = email;
          modified = true;
        }
        if (displayName && userDoc.displayName !== displayName) {
          userDoc.displayName = displayName;
          modified = true;
        }
        if (photoURL && userDoc.photoURL !== photoURL) {
          userDoc.photoURL = photoURL;
          modified = true;
        }
        if (modified) {
          await userDoc.save();
        }
      }

      const userResponse: User = {
        id: userDoc._id.toString(),
        firebaseUid: userDoc.firebaseUid,
        email: userDoc.email,
        displayName: userDoc.displayName,
        photoURL: userDoc.photoURL,
        createdAt: userDoc.createdAt.toISOString(),
        updatedAt: userDoc.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: userResponse,
      });
    } catch (error) {
      console.error('Error in /api/auth/me:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error processing user synchronization',
          code: 'SERVER_ERROR',
        },
      });
    }
  }
);

authRouter.get(
  '/test',
  requireAuth,
  (req: Request, res: Response<ApiResponse<{ message: string; uid: string }>>): void => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Authentication verification successful',
        uid: req.user?.uid || '',
      },
    });
  }
);
