import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../dtos';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

export const taskService = {
  async createTask(userId: string, data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as TaskPriority,
        status: data.status as TaskStatus,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
      },
    });
  },

  async getTasks(userId: string, role: Role, filters: TaskFilterInput) {
    const { page, limit, status, priority, search, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      // Admins see all tasks; users see only their own
      ...(role !== 'ADMIN' ? { userId } : {}),
      ...(status ? { status: status as TaskStatus } : {}),
      ...(priority ? { priority: priority as TaskPriority } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

    const orderBy: Prisma.TaskOrderByWithRelationInput =
      sortBy === 'priority'
        ? { priority: sortOrder as Prisma.SortOrder }
        : { [sortBy ?? 'createdAt']: sortOrder as Prisma.SortOrder };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getTaskById(taskId: string, userId: string, role: Role) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!task) throw new NotFoundError('Task');
    if (role !== 'ADMIN' && task.userId !== userId) throw new ForbiddenError();
    return task;
  },

  async updateTask(taskId: string, userId: string, role: Role, data: UpdateTaskInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');
    if (role !== 'ADMIN' && task.userId !== userId) throw new ForbiddenError();

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.priority !== undefined ? { priority: data.priority as TaskPriority } : {}),
        ...(data.status !== undefined ? { status: data.status as TaskStatus } : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
      },
    });
  },

  async toggleTask(taskId: string, userId: string, role: Role) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');
    if (role !== 'ADMIN' && task.userId !== userId) throw new ForbiddenError();

    const newStatus: TaskStatus =
      task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    return prisma.task.update({ where: { id: taskId }, data: { status: newStatus } });
  },

  async deleteTask(taskId: string, userId: string, role: Role) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');
    if (role !== 'ADMIN' && task.userId !== userId) throw new ForbiddenError();

    await prisma.task.delete({ where: { id: taskId } });
  },

  async getTaskStats(userId: string, role: Role) {
    const where: Prisma.TaskWhereInput = role !== 'ADMIN' ? { userId } : {};
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'PENDING' } }),
      prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
    ]);
    return { total, pending, inProgress, completed };
  },
};
