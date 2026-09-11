import nodemailer from 'nodemailer';

function smtpConfigured() {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  return user.length > 0 && pass.length > 0 && !user.includes('COLOQUE') && !pass.includes('COLOQUE');
}

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function preview(message: string, max = 60): string {
  const single = message.replace(/\s+/g, ' ').trim();
  return single.length > max ? `${single.slice(0, max)}...` : single;
}

type FeedbackInput = {
  userEmail: string;
  userId: string;
  type: 'bug' | 'suggestion' | 'other';
  message: string;
  page: string | null;
};

export const feedbackService = {
  async submit({ userEmail, userId, type, message, page }: FeedbackInput) {
    if (!smtpConfigured()) {
      console.log(
        `[Feedback][DEV] De ${userEmail} (${userId}) [${type}]${page ? ` em ${page}` : ''}: ${message}`
      );
      return;
    }
    const typeLabel =
      type === 'bug' ? 'Bug' : type === 'suggestion' ? 'Sugestão' : 'Outro';
    const html = `
      <div style="font-family: Georgia, 'Times New Roman', serif; margin:0; padding:0; background:#0f0020; background-image:linear-gradient(180deg,#1a0033,#0a0017); padding:32px 16px;">
        <div style="max-width:560px; margin:0 auto; background:linear-gradient(180deg,#240046,#16002e); border-radius:16px; overflow:hidden; border:1px solid #9D4EDD44; box-shadow:0 20px 60px rgba(0,0,0,0.6);">
          <div style="padding:32px 36px; text-align:center; border-bottom:1px solid #9D4EDD33; background:linear-gradient(180deg,rgba(157,78,221,0.18),transparent);">
            <div style="font-size:40px; line-height:1; margin-bottom:8px; filter:drop-shadow(0 2px 6px rgba(157,78,221,0.4));">📖</div>
            <h1 style="margin:0; font-size:22px; letter-spacing:2px; color:#E0AAFF; font-weight:700; font-family:Georgia,'Times New Roman',serif;">The Dark Library</h1>
            <p style="margin:6px 0 0; font-size:12px; letter-spacing:4px; color:#C77DFF; font-family:Georgia,'Times New Roman',serif;">NOVO FEEDBACK — ${typeLabel.toUpperCase()}</p>
          </div>
          <div style="padding:32px 36px; color:#E0AAFF;">
            <div style="display:inline-block; background:#10002B; border:1px solid #C77DFF66; border-radius:999px; padding:6px 18px; font-size:12px; letter-spacing:2px; color:#C77DFF; margin:0 0 20px;">${typeLabel.toUpperCase()}</div>
            <p style="font-size:15px; line-height:1.7; color:#E0AAFF; margin:0 0 24px; white-space:pre-wrap;">${escapeHtml(message)}</p>
            <div style="background:#10002B; border:1px dashed #C77DFF44; border-radius:12px; padding:16px 20px; font-size:12px; line-height:1.8; color:#9D4EDD;">
              <div>De: <strong style="color:#C77DFF;">${escapeHtml(userEmail)}</strong></div>
              <div>Usuário: <strong style="color:#C77DFF;">${escapeHtml(userId)}</strong></div>
              <div>Página: <strong style="color:#C77DFF;">${escapeHtml(page ?? '—')}</strong></div>
              <div>Enviado: <strong style="color:#C77DFF;">${new Date().toLocaleString('pt-BR')}</strong></div>
            </div>
          </div>
          <div style="padding:20px 36px; border-top:1px solid #9D4EDD33; text-align:center;">
            <p style="font-size:11px; letter-spacing:2px; color:#7B2CBF; margin:0; font-family:Georgia,'Times New Roman',serif;">THE DARK LIBRARY</p>
            <p style="font-size:11px; color:#5A189A; margin:4px 0 0; font-family:Georgia,'Times New Roman',serif;">Um mundo para cada história.</p>
          </div>
        </div>
      </div>
    `;
    try {
      await smtpTransporter.sendMail({
        from: `"The Dark Library — Feedback" <${smtpUser}>`,
        to: smtpUser,
        replyTo: userEmail,
        subject: `[Feedback][${typeLabel}] ${preview(message)}`,
        html,
      });
      console.log(`[Feedback] Feedback de ${userEmail} enviado`);
    } catch (error) {
      console.error('[Feedback] Falha ao enviar email de feedback:', error);
      throw new Error('EMAIL_SEND_FAILED');
    }
  },
};