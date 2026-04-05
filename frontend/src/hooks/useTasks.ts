'use client';
import { useState, useCallback } from 'react';
import { Task, TaskFilters, TaskStats } from '@/types';
import { taskService } from '@/services/task.service';
import { PaginationMeta } from '@/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await taskService.getTasks(filters);
      setTasks(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await taskService.getStats();
      setStats(res.data || null);
    } catch {}
  }, []);

  return { tasks, stats, meta, isLoading, error, fetchTasks, fetchStats, setTasks };
};
