import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  public details: Record<string, string[]>;

  constructor(details: Record<string, string[]>) {
    super('Validation failed', 400);
    this.details = details;
  }
}

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const key = e.path.join('.');
      details[key] = details[key] ? [...details[key], e.message] : [e.message];
    });
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      details,
    });
    return;
  }

  // Operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError ? { details: err.details } : {}),
    });
    return;
  }

  // Prisma errors
  const prismaErrors: Record<string, { statusCode: number; message: string }> = {
    P2002: { statusCode: 409, message: 'A record with that value already exists' },
    P2025: { statusCode: 404, message: 'Record not found' },
    P2003: { statusCode: 400, message: 'Foreign key constraint failed' },
  };

  const matchedPrisma = Object.entries(prismaErrors).find(([code]) =>
    err.message.includes(code)
  );
  if (matchedPrisma) {
    res.status(matchedPrisma[1].statusCode).json({
      success: false,
      message: matchedPrisma[1].message,
    });
    return;
  }

  // Unknown errors
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { error: err.message } : {}),
  });
};
