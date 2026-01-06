import nodemailer from 'nodemailer';

let transporter = null;

// Inicializar transporter de email
function initTransporter() {
  if (transporter) return transporter;

  // Se não tiver configuração de email, retornar null (modo desenvolvimento)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('⚠️  SMTP não configurado. Emails não serão enviados.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

export async function sendPasswordResetEmail(email, token) {
  const emailTransporter = initTransporter();

  if (!emailTransporter) {
    console.log(`📧 [DEV MODE] Link de recuperação para ${email}: ${process.env.FRONTEND_URL}/ResetPassword?token=${token}`);
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL}/ResetPassword?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'MoneyNow <noreply@moneynow.com>',
    to: email,
    subject: 'Recuperação de Senha - MoneyNow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00D68F 0%, #00B578 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #00D68F; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MoneyNow</h1>
          </div>
          <div class="content">
            <h2>Recuperação de Senha</h2>
            <p>Olá,</p>
            <p>Você solicitou a recuperação de senha para sua conta MoneyNow.</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta recuperação, ignore este email.</p>
          </div>
          <div class="footer">
            <p>MoneyNow - Gestão Financeira Pessoal</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperação enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

