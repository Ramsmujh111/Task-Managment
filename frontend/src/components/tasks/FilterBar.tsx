'use client';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { TaskFilters, TaskStatus, TaskPriority } from '@/types';

interface Props {
  filters: TaskFilters;
  onChange: (f: Partial<TaskFilters>) => void;
}



export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="glass-card filter-bar">
      <div className="search-wrapper">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search tasks..."
          className="form-input search-input"
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
        />
      </div>

      <div className="filter-group">
        <Filter size={15} style={{ color: 'var(--color-text-subtle)' }} />
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 130 }}
          value={filters.status || ''}
          onChange={(e) => onChange({ status: e.target.value as TaskStatus | '', page: 1 })}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 130 }}
          value={filters.priority || ''}
          onChange={(e) => onChange({ priority: e.target.value as TaskPriority | '', page: 1 })}
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => onChange({ sortBy: e.target.value as TaskFilters['sortBy'] })}
        >
          <option value="createdAt">Created Date</option>
          <option value="updatedAt">Updated Date</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>

        <button
          className="btn btn-secondary btn-icon"
          title="Toggle sort order"
          onClick={() => onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
        >
          {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
        </button>
      </div>
    </div>
  );
}
