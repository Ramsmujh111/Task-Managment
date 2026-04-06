import nodemailer from 'nodemailer';
import { env } from '../config/env';

/**
 * Sends a password-reset email.
 * In development (or when SMTP is not configured), the reset link
 * is printed to the console so you can test without a real mail account.
 */
export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  const isSmtpConfigured = env.SMTP_IS_DEV === "no";
  // ── Dev / no-SMTP mode ────────────────────────────────────────────────────
  if (!isSmtpConfigured) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🔑  PASSWORD RESET LINK (dev mode – no SMTP configured)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  To   : ${toEmail}`);
    console.log(`  Link : ${resetUrl}`);
    console.log('  (expires in 1 hour)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    return;
  }

  // ── Production / SMTP mode ─────────────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"TaskFlow" <${env.SMTP_FROM}>`,
    to: toEmail,
    subject: 'Reset your TaskFlow password',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Inter, Arial, sans-serif; background:#080818; color:#e2e8f0; margin:0; padding:40px 20px;">
          <div style="max-width:480px; margin:0 auto; background:#0f0f2e; border:1px solid rgba(139,92,246,0.2); border-radius:14px; padding:40px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:32px;">
              <div style="width:44px; height:44px; background:linear-gradient(135deg,#8b5cf6,#6366f1); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px;">✓</div>
              <span style="font-size:22px; font-weight:800;">Task<span style="color:#a78bfa;">Flow</span></span>
            </div>
            <h1 style="font-size:24px; font-weight:700; margin:0 0 8px;">Reset your password</h1>
            <p style="color:#94a3b8; margin:0 0 28px;">You requested a password reset. Click the button below — this link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block; padding:14px 28px; background:linear-gradient(135deg,#8b5cf6,#6366f1); color:#fff; font-weight:700; font-size:15px; text-decoration:none; border-radius:10px;">Reset Password</a>
            <p style="margin:24px 0 0; font-size:12px; color:#64748b;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
            <hr style="margin:24px 0; border:none; border-top:1px solid rgba(139,92,246,0.2);">
            <p style="margin:0; font-size:11px; color:#64748b;">Or paste this URL: <a href="${resetUrl}" style="color:#a78bfa;">${resetUrl}</a></p>
          </div>
        </body>
      </html>
    `,
  });
}
