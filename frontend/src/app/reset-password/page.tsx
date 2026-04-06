'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckSquare, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '@/services/auth.service';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const newPasswordValue = watch('newPassword', '');

  // Strength indicator
  const checks = [
    { label: '8+ characters', ok: newPasswordValue.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(newPasswordValue) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(newPasswordValue) },
    { label: 'Number', ok: /[0-9]/.test(newPasswordValue) },
  ];
  const strengthScore = checks.filter((c) => c.ok).length;
  const strengthColors = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/login');
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [success, router]);

  const onSubmit = async (data: Form) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.newPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Missing token ─────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="auth-page">
        <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo" style={{ justifyContent: 'center' }}>
            <div className="auth-logo-icon">
              <CheckSquare size={22} color="white" />
            </div>
            <span className="auth-logo-text">
              Task<span style={{ color: 'var(--color-primary-light)' }}>Flow</span>
            </span>
          </div>

          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <AlertCircle size={28} color="var(--color-danger)" />
          </div>
          <h1 className="auth-title" style={{ fontSize: 20 }}>
            Invalid reset link
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '8px 0 24px' }}>
            This link is missing a reset token. Please request a new one.
          </p>
          <Link href="/forgot-password" className="btn btn-primary btn-full">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="auth-page">
        <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo" style={{ justifyContent: 'center' }}>
            <div className="auth-logo-icon">
              <CheckSquare size={22} color="white" />
            </div>
            <span className="auth-logo-text">
              Task<span style={{ color: 'var(--color-primary-light)' }}>Flow</span>
            </span>
          </div>

          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'fadeSlideIn 0.4s ease',
            }}
          >
            <CheckCircle size={34} color="var(--color-success)" />
          </div>

          <h1 className="auth-title" style={{ fontSize: 22 }}>
            Password updated!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '8px 0 28px', lineHeight: 1.7 }}>
            Your password has been reset successfully. All other sessions have been signed out for your security.
          </p>

          <div
            style={{
              fontSize: 13,
              color: 'var(--color-text-subtle)',
              marginBottom: 20,
              padding: '12px 16px',
              background: 'rgba(139, 92, 246, 0.06)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Redirecting to login in <strong style={{ color: 'var(--color-primary-light)' }}>{countdown}s</strong>…
          </div>

          <Link href="/login" className="btn btn-primary btn-full">
            Go to Sign In now
          </Link>
        </div>
      </div>
    );
  }

  // ── Reset Form ────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <CheckSquare size={22} color="white" />
          </div>
          <span className="auth-logo-text">
            Task<span style={{ color: 'var(--color-primary-light)' }}>Flow</span>
          </span>
        </div>

        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">Create a strong password for your account.</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-subtle)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                className={`form-input${errors.newPassword ? ' error' : ''}`}
                style={{ paddingLeft: 42, paddingRight: 44 }}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-subtle)',
                }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="form-error">{errors.newPassword.message}</span>
            )}

            {/* Password strength bar */}
            {newPasswordValue.length > 0 && (
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-subtle)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                style={{ paddingLeft: 42, paddingRight: 44 }}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-subtle)',
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={isLoading}
          >
            {isLoading ? <div className="spinner" /> : <Lock size={18} />}
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          <Link href="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="glass-card auth-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <div className="spinner" />
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
