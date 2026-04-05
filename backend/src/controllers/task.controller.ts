import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { TaskFilterInput } from '../dtos';

export const taskController = {
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.user!.userId, req.body);
      sendSuccess(res, task, 'Task created', 201);
    } catch (err) {
      next(err);
    }
  },

  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.getTasks(
        req.user!.userId,
        req.user!.role,
        req.query as unknown as TaskFilterInput
      );
      sendSuccess(res, result.tasks, 'Tasks retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  },

  async getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user!.userId, req.user!.role);
      sendSuccess(res, task, 'Task retrieved');
    } catch (err) {
      next(err);
    }
  },

  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTask(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        req.body
      );
      sendSuccess(res, task, 'Task updated');
    } catch (err) {
      next(err);
    }
  },

  async toggleTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.toggleTask(req.params.id, req.user!.userId, req.user!.role);
      sendSuccess(res, task, 'Task status toggled');
    } catch (err) {
      next(err);
    }
  },

  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await taskService.deleteTask(req.params.id, req.user!.userId, req.user!.role);
      sendSuccess(res, null, 'Task deleted');
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await taskService.getTaskStats(req.user!.userId, req.user!.role);
      sendSuccess(res, stats, 'Stats retrieved');
    } catch (err) {
      next(err);
    }
  },
};
