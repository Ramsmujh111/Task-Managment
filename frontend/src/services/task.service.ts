import apiClient from '@/lib/apiClient';
import { ApiResponse, Task, TaskFilters, TaskStats, CreateTaskData, UpdateTaskData } from '@/types';

export const taskService = {
  async getTasks(filters: TaskFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.append(k, String(v));
    });
    const { data } = await apiClient.get<ApiResponse<Task[]>>(`/tasks?${params}`);
    return data;
  },

  async getTaskById(id: string) {
    const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data;
  },

  async createTask(payload: CreateTaskData) {
    const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
    return data;
  },

  async updateTask(id: string, payload: UpdateTaskData) {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data;
  },

  async toggleTask(id: string) {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/toggle`);
    return data;
  },

  async deleteTask(id: string) {
    const { data } = await apiClient.delete<ApiResponse>(`/tasks/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await apiClient.get<ApiResponse<TaskStats>>('/tasks/stats');
    return data;
  },
};
