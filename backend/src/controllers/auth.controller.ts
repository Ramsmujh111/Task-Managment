import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      sendSuccess(res, user, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  },
};
