import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dtos';

const router = Router();

// POST /auth/register
router.post('/register', validate(RegisterDto), authController.register);

// POST /auth/login
router.post('/login', validate(LoginDto), authController.login);

// POST /auth/refresh
router.post('/refresh', validate(RefreshTokenDto), authController.refresh);

// POST /auth/logout
router.post('/logout', validate(RefreshTokenDto), authController.logout);

// GET /auth/me (protected)
router.get('/me', authenticate, authController.me);

export default router;
