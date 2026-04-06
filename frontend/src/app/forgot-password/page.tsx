'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { CheckSquare, Mail, ArrowLeft, Send } from 'lucide-react';
import { authService } from '@/services/auth.service';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      // Always show success to not reveal if email exists
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <CheckSquare size={22} color="white" />
          </div>
          <span className="auth-logo-text">
            Task<span style={{ color: 'var(--color-primary-light)' }}>Flow</span>
          </span>
        </div>

        {!submitted ? (
          /* ── Request Form ── */
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-subtitle">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
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
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`form-input${errors.email ? ' error' : ''}`}
                    style={{ paddingLeft: 42 }}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={isLoading}
              >
                {isLoading ? <div className="spinner" /> : <Send size={18} />}
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: 24 }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'color var(--transition-fast)',
                }}
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          /* ── Success State ── */
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 0 24px',
                animation: 'fadeSlideIn 0.4s ease',
              }}
            >
              <Mail size={28} color="var(--color-success)" />
            </div>

            <h1 className="auth-title" style={{ fontSize: 22 }}>
              Check your inbox
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
                margin: '8px 0 28px',
              }}
            >
              If <strong style={{ color: 'var(--color-text)' }}>{submittedEmail}</strong> is
              registered, you&apos;ll receive a password reset link within a few minutes.
            </p>

            <div
              className="glass-card"
              style={{
                padding: '16px 20px',
                background: 'rgba(139, 92, 246, 0.06)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              💡 <strong style={{ color: 'var(--color-text)' }}>Dev tip:</strong> The reset
              link is printed to the{' '}
              <strong style={{ color: 'var(--color-primary-light)' }}>backend console</strong>{' '}
              since no SMTP is configured.
            </div>

            <button
              className="btn btn-secondary btn-full"
              onClick={() => {
                setSubmitted(false);
                setSubmittedEmail('');
              }}
            >
              Try a different email
            </button>

            <div className="auth-footer" style={{ marginTop: 20 }}>
              <Link href="/login" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
