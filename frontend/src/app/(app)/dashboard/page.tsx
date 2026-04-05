'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { taskService } from '@/services/task.service';
import toast from 'react-hot-toast';
import {
  CheckCircle2, Clock, ListTodo, TrendingUp, Plus, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, stats, isLoading, fetchTasks, fetchStats } = useTasks();

  useEffect(() => {
    fetchStats();
    fetchTasks({ limit: 5, sortOrder: 'desc' });
  }, [fetchStats, fetchTasks]);

  const handleToggle = async (id: string) => {
    try {
      await taskService.toggleTask(id);
      fetchTasks({ limit: 5, sortOrder: 'desc' });
      fetchStats();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const statCards = [
    { label: 'Total Tasks', value: stats?.total ?? 0, icon: ListTodo, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    { label: 'Pending', value: stats?.pending ?? 0, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  ];

  const completionRate = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]} 👋</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15 }}>
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div className="stat-value" style={{ color }}>{isLoading ? '—' : value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Progress */}
      {stats && stats.total > 0 && (
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary-light)' }}>{completionRate}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--color-surface-3)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionRate}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: 8, transition: 'width 0.6s ease' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>
      )}

      {/* Recent Tasks */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent Tasks</h2>
        <Link href="/tasks" className="btn btn-secondary btn-sm">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-icon"><ListTodo size={32} /></div>
          <h3 className="empty-title">No tasks yet</h3>

          <p className="empty-subtitle">Create your first task to get started</p>
          <Link href="/tasks" className="btn btn-primary">
            <Plus size={16} /> Create Task
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div key={task.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => handleToggle(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0 }}>
                  {isCompleted
                    ? <CheckCircle2 size={20} color="var(--color-success)" />
                    : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--color-text-subtle)' }} />
                  }
                </button>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                  {task.title}
                </span>
                <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
