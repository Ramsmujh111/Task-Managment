import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types';
import { Role } from '@prisma/client';

export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    algorithm: 'HS256',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: Pick<AuthPayload, 'userId'>): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
};

export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
