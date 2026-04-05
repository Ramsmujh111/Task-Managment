'use client';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Task, CreateTaskData } from '@/types';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(50, 'Title is max 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters long').max(500, 'Description is max 500 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: z.string().min(1, 'Due date is required')
});


type Form = z.infer<typeof schema>;

interface Props {
  task?: Task | null;
  onClose: () => void;
  onSave: (data: CreateTaskData) => Promise<void>;
  isLoading?: boolean;
}

export default function TaskModal({ task, onClose, onSave, isLoading }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: task
      ? {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : today,
      }
      : { priority: 'MEDIUM', status: 'PENDING', dueDate: today },
  });

  const titleValue = watch('title', '');
  const descriptionValue = watch('description', '');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: Form) => {
    await onSave({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    });
    reset();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="glass-card modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>

          <div className="form-group">
            <label className="form-label" htmlFor="task-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Title *</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: titleValue.length > 50 ? 'var(--color-danger)' : 'var(--color-text-subtle)' }}>
                {titleValue.length} / 50
              </span>
            </label>
            <input id="task-title" type="text" placeholder="What needs to be done?" className={`form-input${errors.title ? ' error' : ''}`} {...register('title')} maxLength={50} />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Description *</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: descriptionValue.length > 500 ? 'var(--color-danger)' : 'var(--color-text-subtle)' }}>
                {descriptionValue.length} / 500
              </span>
            </label>
            <textarea id="task-desc" placeholder="Add more details..." className="form-textarea" {...register('description')} maxLength={500} />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority *</label>
              <select id="task-priority" className="form-select" {...register('priority')}>
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🔵 Medium</option>
                <option value="HIGH">🟡 High</option>
                <option value="URGENT">🔴 Urgent</option>
              </select>
              {errors.priority && <span className="form-error">{errors.priority.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status *</label>
              <select id="task-status" className="form-select" {...register('status')}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              {errors.status && <span className="form-error">{errors.status.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-due">Due Date *</label>
            <input id="task-due" type="date" className="form-input" {...register('dueDate')}
              style={{ colorScheme: 'dark' }} />
            {errors.dueDate && <span className="form-error">{errors.dueDate.message}</span>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <div className="spinner" /> : null}
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
