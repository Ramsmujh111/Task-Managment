'use client';

export default function TaskSkeleton() {
  return (
    <div className="glass-card task-card skeleton-card">
      <div className="task-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
          <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60%', height: 18, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '90%', height: 14 }} />
          </div>
        </div>
      </div>

      <div className="task-footer" style={{ marginTop: 12 }}>
        <div className="task-meta" style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 11 }} />
          <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 11 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="skeleton" style={{ width: 70, height: 12 }} />
          <div className="skeleton" style={{ width: 100, height: 12 }} />
        </div>
      </div>
    </div>
  );
}
