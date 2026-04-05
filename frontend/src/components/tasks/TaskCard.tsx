'use client';
import { Task } from '@/types';
import { Calendar, CheckCircle2, Circle, Clock, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityClass: Record<string, string> = {
  LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', URGENT: 'badge-urgent',
};
const statusClass: Record<string, string> = {
  PENDING: 'badge-pending', IN_PROGRESS: 'badge-in_progress', COMPLETED: 'badge-completed',
};
const statusLabel: Record<string, string> = {
  PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed',
};

export default function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const isCompleted = task.status === 'COMPLETED';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div className="glass-card task-card">
      <div className="task-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button
            onClick={() => onToggle(task.id)}
            className="btn btn-ghost btn-icon"
            style={{ marginTop: -2, flexShrink: 0, padding: 4 }}
            title="Toggle status"
          >
            {isCompleted
              ? <CheckCircle2 size={20} color="var(--color-success)" />
              : <Circle size={20} color="var(--color-text-subtle)" />
            }
          </button>
          <div>
            <p className={`task-title${isCompleted ? ' completed' : ''}`}>{task.title}</p>
            {task.description && (
              <p className="task-description" style={{ marginTop: 4 }}>{task.description}</p>
            )}
          </div>
        </div>
        <div className="task-actions">
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(task)} title="Edit">
            <Pencil size={14} />
          </button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(task.id)} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-meta">
          <span className={`badge ${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
          <span className={`badge ${priorityClass[task.priority]}`}>{task.priority}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {task.dueDate && (
            <span className="task-date" style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-text-subtle)' }}>
              <Clock size={11} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          <span className="task-date">
            <Calendar size={11} />
            {format(new Date(task.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
}
