'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  CheckSquare, LayoutDashboard, ListTodo, LogOut, Settings, Shield,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'My Tasks', icon: ListTodo },
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CheckSquare size={18} color="white" />
        </div>
        <span className="sidebar-logo-text">Task<span>Flow</span></span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-label">Navigation</span>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname.startsWith(href) ? 'active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" style={{ marginBottom: 12 }}>
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role?.toLowerCase()}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-full">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  );
}
