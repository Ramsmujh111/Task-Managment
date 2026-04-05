import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TaskFlow – Modern Task Management',
  description: 'A production-ready task management system with JWT authentication, real-time updates, and powerful filtering.',
  keywords: ['task management', 'productivity', 'todo', 'project management'],
  openGraph: {
    title: 'TaskFlow – Modern Task Management',
    description: 'Manage your tasks efficiently with TaskFlow',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 15, 30, 0.95)',
                color: '#e2e8f0',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#a78bfa', secondary: '#0f0f1e' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#0f0f1e' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
