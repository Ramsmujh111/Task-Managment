import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dtos';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /tasks/stats
router.get('/stats', taskController.getStats);

// GET /tasks
router.get('/', validate(TaskFilterDto, 'query'), taskController.getTasks);

// POST /tasks
router.post('/', validate(CreateTaskDto), taskController.createTask);

// GET /tasks/:id
router.get('/:id', taskController.getTaskById);

// PATCH /tasks/:id
router.patch('/:id', validate(UpdateTaskDto), taskController.updateTask);

// PATCH /tasks/:id/toggle
router.patch('/:id/toggle', taskController.toggleTask);

// DELETE /tasks/:id
router.delete('/:id', taskController.deleteTask);

export default router;
