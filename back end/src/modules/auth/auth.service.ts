import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN: jwt.SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '7d';

// --- Email via Resend (HTTPS) — SMTP é bloqueado no Render ---
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.RESEND_FROM || 'The Dark Library <noreply@thedarklibrary.com>';

function createVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[Auth][DEV] Código de verificação para ${to}: ${code}`);
    return false;
  }
  const emailHtml = `
    <div style="font-family: Georgia, 'Times New Roman', serif; margin:0; padding:0; background:#0f0020; background-image:linear-gradient(180deg,#1a0033,#0a0017); padding:32px 16px;">
      <div style="max-width:560px; margin:0 auto; background:linear-gradient(180deg,#240046,#16002e); border-radius:16px; overflow:hidden; border:1px solid #9D4EDD44; box-shadow:0 20px 60px rgba(0,0,0,0.6);">
        <div style="padding:32px 36px; text-align:center; border-bottom:1px solid #9D4EDD33; background:linear-gradient(180deg,rgba(157,78,221,0.18),transparent);">
          <div style="font-size:40px; line-height:1; margin-bottom:8px; filter:drop-shadow(0 2px 6px rgba(157,78,221,0.4));">📖</div>
          <h1 style="margin:0; font-size:26px; letter-spacing:2px; color:#E0AAFF; font-weight:700; font-family:Georgia,'Times New Roman',serif;">The Dark Library</h1>
          <p style="margin:6px 0 0; font-size:12px; letter-spacing:4px; color:#C77DFF; font-family:Georgia,'Times New Roman',serif;">VERIFICAÇÃO DE CONTA</p>
        </div>
        <div style="padding:32px 36px; color:#E0AAFF;">
          <p style="font-size:15px; line-height:1.7; color:#C77DFF; margin:0 0 20px;">Olá! Estamos quase lá. Use o código abaixo para concluir seu cadastro e entrar na biblioteca:</p>
          <div style="background:#10002B; border:1px dashed #C77DFF88; border-radius:12px; padding:24px; text-align:center; margin:0 0 20px;">
            <span style="font-size:38px; font-weight:bold; letter-spacing:10px; color:#E0AAFF;">${code}</span>
          </div>
          <p style="font-size:13px; line-height:1.6; color:#9D4EDD; margin:0;">Este código expira em <strong style="color:#C77DFF;">10 minutos</strong>. Se você não solicitou este cadastro, ignore este email.</p>
        </div>
        <div style="padding:20px 36px; border-top:1px solid #9D4EDD33; text-align:center;">
          <p style="font-size:11px; letter-spacing:2px; color:#7B2CBF; margin:0; font-family:Georgia,'Times New Roman',serif;">THE DARK LIBRARY</p>
          <p style="font-size:11px; color:#5A189A; margin:4px 0 0; font-family:Georgia,'Times New Roman',serif;">Um mundo para cada história.</p>
        </div>
      </div>
    </div>
  `;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject: 'Seu código de verificação — The Dark Library',
        html: emailHtml,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      console.error('[Auth] Resend falhou:', response.status, await response.text());
      return false;
    }
    console.log(`[Auth] Email de verificação enviado para ${to}`);
    return true;
  } catch (error) {
    console.error('[Auth] Falha ao enviar email via Resend:', error);
    return false;
  }
}

type RegisterInput = {
  email: string;
  password: string;
};

export const authService = {
  async register({ email, password }: RegisterInput) {
    const emailNormalized = email.trim().toLowerCase();

    const existing = await db.query('SELECT id, verified FROM users WHERE email = $1', [emailNormalized]);
    if (existing.rows.length > 0 && existing.rows[0].verified) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing.rows.length === 0) {
      await db.query(
        "INSERT INTO users (email, password_hash, role, verified) VALUES ($1, $2, 'reader', FALSE)",
        [emailNormalized, passwordHash]
      );
    } else {
      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
        passwordHash,
        existing.rows[0].id,
      ]);
    }

    await db.query('UPDATE verification_codes SET used = TRUE WHERE email = $1 AND used = FALSE', [emailNormalized]);

    const code = createVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.query(
      'INSERT INTO verification_codes (email, code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
      [emailNormalized, code, 'verify', expiresAt]
    );

    const sent = await sendVerificationEmail(emailNormalized, code);

    if (!sent) {
      await db.query('UPDATE users SET verified = TRUE WHERE email = $1', [emailNormalized]);
    }

    return { email: emailNormalized, needsVerification: sent };
  },

  async verify(email: string, code: string) {
    const emailNormalized = email.trim().toLowerCase();

    const result = await db.query(
      `SELECT id FROM verification_codes
       WHERE email = $1 AND code = $2 AND purpose = 'verify' AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [emailNormalized, code]
    );

    if (result.rows.length === 0) {
      throw new Error('INVALID_OR_EXPIRED_CODE');
    }

    await db.query('UPDATE verification_codes SET used = TRUE WHERE id = $1', [result.rows[0].id]);
    await db.query('UPDATE users SET verified = TRUE WHERE email = $1', [emailNormalized]);

    return { email: emailNormalized, verified: true };
  },

  async login(email: string, password: string) {
    const emailNormalized = email.trim().toLowerCase();

    const result = await db.query(
      'SELECT id, email, password_hash, role, verified FROM users WHERE email = $1',
      [emailNormalized]
    );

    if (result.rows.length === 0) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = result.rows[0];
    if (!user.verified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  me(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      return payload;
    } catch {
      throw new Error('UNAUTHORIZED');
    }
  },

  generateTokenForUser(user: { id: string; email: string; role: string }) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  },

  async seedAdmin() {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';

    if (!email || !password) {
      console.warn('[Auth] ADMIN_EMAIL/ADMIN_PASSWORD não definidos no .env — admin não criado.');
      return;
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      const passwordHash = await bcrypt.hash(password, 10);
      await db.query(
        "INSERT INTO users (email, password_hash, role, verified) VALUES ($1, $2, 'owner', TRUE)",
        [email, passwordHash]
      );
      console.log(`[Auth] Admin criado: ${email}`);
    } else {
      const user = existing.rows[0];
      await db.query(
        "UPDATE users SET role = 'owner', verified = TRUE WHERE id = $1",
        [user.id]
      );
      console.log(`[Auth] Admin configurado (role=owner): ${email}`);
    }
  },
};