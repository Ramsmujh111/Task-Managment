import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { RegisterInput, LoginInput } from '../dtos';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { AppError, UnauthorizedError, NotFoundError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { user, accessToken, refreshToken };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  async refresh(oldRefreshToken: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    try {
      verifyRefreshToken(oldRefreshToken);
    } catch {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Rotate: revoke old, issue new
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const user = tokenRecord.user;
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (tokenRecord) {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
    }
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  },
};
