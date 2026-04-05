'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { taskService } from '@/services/task.service';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';
import FilterBar from '@/components/tasks/FilterBar';
import TaskSkeleton from '@/components/tasks/TaskSkeleton';
import { Task, TaskFilters, CreateTaskData } from '@/types';
import toast from 'react-hot-toast';
import { Plus, ListTodo } from 'lucide-react';

export default function TasksPage() {
  const { tasks, meta, isLoading, error, fetchTasks } = useTasks();
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTasks = useCallback((f: TaskFilters) => {
    setIsDebouncing(false);
    fetchTasks(f);
  }, [fetchTasks]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadTasks(filters), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, loadTasks]);

  const updateFilters = (partial: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    if (Object.keys(partial).some(k => k !== 'page')) {
      setIsDebouncing(true);
    }
  };

  const handleSave = async (data: CreateTaskData) => {
    setSavingTask(true);
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, data);
        toast.success('Task updated!');
      } else {
        await taskService.createTask(data);
        toast.success('Task created!');
      }
      setShowModal(false);
      setEditingTask(null);
      loadTasks(filters);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Failed to save task');
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await taskService.toggleTask(id);
      loadTasks(filters);
    } catch {
      toast.error('Failed to toggle task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await taskService.deleteTask(id);
      toast.success('Task deleted');
      loadTasks(filters);
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>My Tasks</h1>
          {meta ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {meta.total} task{meta.total !== 1 ? 's' : ''} total
            </p>
          ) : (
            <div className="skeleton" style={{ width: 80, height: 14, marginTop: 6 }} />
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingTask(null); setShowModal(true); }}
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={updateFilters} />

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      {/* Task List */}
      {(isLoading || isDebouncing) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(filters.limit || 5)].map((_, i) => (
            <TaskSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-icon"><ListTodo size={32} /></div>
          <h3 className="empty-title">No tasks found</h3>
          <p className="empty-subtitle">
            {filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Create your first task to get started!'}
          </p>
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
            <Plus size={16} /> Create Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={filters.page === 1}
            onClick={() => updateFilters({ page: (filters.page || 1) - 1 })}
          >←</button>

          {[...Array(meta.totalPages)].map((_, i) => {
            const p = i + 1;
            const cur = filters.page || 1;
            if (p === 1 || p === meta.totalPages || (p >= cur - 1 && p <= cur + 1)) {
              return (
                <button
                  key={p}
                  className={`page-btn${p === cur ? ' active' : ''}`}
                  onClick={() => updateFilters({ page: p })}
                >{p}</button>
              );
            }
            if (p === cur - 2 || p === cur + 2) return <span key={p} style={{ color: 'var(--color-text-subtle)' }}>…</span>;
            return null;
          })}

          <button
            className="page-btn"
            disabled={filters.page === meta.totalPages}
            onClick={() => updateFilters({ page: (filters.page || 1) + 1 })}
          >→</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSave}
          isLoading={savingTask}
        />
      )}
    </div>
  );
}
