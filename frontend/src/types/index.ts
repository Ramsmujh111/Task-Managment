export type Role = 'USER' | 'ADMIN';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  userId: string;
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: string;
  details?: Record<string, string[]>;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  search?: string;
  sortBy?: SortBy;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  status?: TaskStatus;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}
