import { z } from 'zod';

// ─── Auth DTOs ──────────────────────────────────────────────────────────────

export const RegisterDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
});

export const LoginDto = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Task DTOs ───────────────────────────────────────────────────────────────

export const CreateTaskDto = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  dueDate: z.string().datetime({ message: 'Invalid date format' }).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional().default('PENDING'),
});

export const UpdateTaskDto = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const TaskFilterDto = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
export type TaskFilterInput = z.infer<typeof TaskFilterDto>;
