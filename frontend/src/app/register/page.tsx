'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckSquare, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Invalid email').max(50, 'Email must be at most 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be at most 50 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string().max(50, 'Confirm Password must be at most 50 characters'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch('password', '');

  // Strength indicator
  const checks = [
    { label: '8+ characters', ok: passwordValue.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(passwordValue) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(passwordValue) },
    { label: 'Number', ok: /[0-9]/.test(passwordValue) },
  ];
  const strengthScore = checks.filter((c) => c.ok).length;
  const strengthColors = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Welcome to TaskFlow 🚀');
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <CheckSquare size={22} color="white" />
          </div>
          <span className="auth-logo-text">Task<span style={{ color: 'var(--color-primary-light)' }}>Flow</span></span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start managing your tasks for free</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="John Doe" className={`form-input${errors.name ? ' error' : ''}`} {...register('name')} maxLength={50} />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" className={`form-input${errors.email ? ' error' : ''}`} {...register('email')} maxLength={50} />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={`form-input${errors.password ? ' error' : ''}`}
                style={{ paddingRight: 44 }}
                {...register('password')}
                maxLength={50}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}

            {/* Password strength bar */}
            {passwordValue.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    marginBottom: 6,
                  }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 4,
                        background: i <= strengthScore ? strengthColors[strengthScore] : 'var(--color-surface-3)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {checks.map((c) => (
                      <span
                        key={c.label}
                        style={{
                          fontSize: 11,
                          color: c.ok ? 'var(--color-success)' : 'var(--color-text-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {c.ok ? '✓' : '○'} {c.label}
                      </span>
                    ))}
                  </div>
                  {strengthScore > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: strengthColors[strengthScore],
                      }}
                    >
                      {strengthLabels[strengthScore]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                style={{ paddingRight: 44 }}
                {...register('confirmPassword')}
                maxLength={50}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)' }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={isLoading}>
            {isLoading ? <div className="spinner" /> : <UserPlus size={18} />}
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>
        <div className="auth-footer">
          <Link href="/login">Sign in instead →</Link>
        </div>
      </div>
    </div>
  );
}
