import nodemailer from 'nodemailer';

// Configuração do email
const EMAIL_CONFIG = {
  // Gmail/Google Workspace
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para outros
  auth: {
    user: process.env.EMAIL_USER, // seu email
    pass: process.env.EMAIL_PASS  // password ou app password
  }
};

// Criar transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth,
    tls: {
      rejectUnauthorized: false
    }
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// Função principal para enviar emails
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Verificar se as credenciais estão configuradas
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.error('❌ Credenciais de email não configuradas');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"Prismas33" <${EMAIL_CONFIG.auth.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text?.replace(/\n/g, '<br>'),
      attachments: options.attachments
    };

    console.log('📧 Enviando email para:', options.to);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado:', info.messageId);
    return true;

  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error.message);
    return false;
  }
}

// Função melhorada que retorna objeto com detalhes
export async function sendEmailWithDetails(options: EmailOptions): Promise<EmailResult> {
  try {
    // Verificar se as credenciais estão configuradas
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      const error = 'Credenciais de email não configuradas';
      console.error('❌', error);
      return { success: false, error };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"Prismas33" <${EMAIL_CONFIG.auth.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text?.replace(/\n/g, '<br>'),
      attachments: options.attachments
    };

    console.log('📧 Enviando email para:', options.to);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error.message);
    return { success: false, error: error.message };
  }
}

// Email de notificação para admin
export async function sendAdminNotification(data: {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  projectType: string;
  message: string;
  messageId: string;
  isNewClient: boolean;
}): Promise<boolean> {
  
  const subject = `🔔 Novo Contato: ${data.clientName} - ${data.projectType}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007acc;">Nova Mensagem Recebida</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Dados do Cliente</h3>
        <p><strong>Nome:</strong> ${data.clientName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.clientEmail}">${data.clientEmail}</a></p>
        <p><strong>Telefone:</strong> ${data.clientPhone || 'Não informado'}</p>
        <p><strong>Empresa:</strong> ${data.clientCompany || 'Não informado'}</p>
        <p><strong>Tipo de Projeto:</strong> ${data.projectType}</p>
        <p><strong>Cliente Novo:</strong> ${data.isNewClient ? '✅ Sim' : '❌ Não'}</p>
        <p><strong>ID da Mensagem:</strong> ${data.messageId}</p>
      </div>

      <div style="background: #e9ecef; padding: 20px; border-radius: 5px;">
        <h3>Mensagem do Cliente</h3>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>

      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Este email foi enviado automaticamente pelo sistema Prismas33.
      </p>
    </div>
  `;

  return await sendEmail({
    to: 'geral.prismas@gmail.com',
    subject,
    html
  });
}

// Email de confirmação para cliente
export async function sendClientConfirmation(data: {
  clientName: string;
  clientEmail: string;
  projectType: string;
  message: string;
  messageId: string;
}): Promise<boolean> {
  
  const subject = `✅ Confirmação: Recebemos o seu pedido - ${data.projectType}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007acc;">Obrigado pelo seu contacto!</h2>
      
      <p>Olá <strong>${data.clientName}</strong>,</p>
      
      <p>Recebemos o seu interesse em "<strong>${data.projectType}</strong>" e agradecemos a confiança na Prismas33.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Resumo do seu pedido</h3>
        <p><strong>Tipo de Projeto:</strong> ${data.projectType}</p>
        <p><strong>Email de contacto:</strong> ${data.clientEmail}</p>
        <p><strong>Referência:</strong> ${data.messageId}</p>
      </div>

      <div style="background: #e9ecef; padding: 20px; border-radius: 5px;">
        <h3>A sua mensagem</h3>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>

      <p><strong>Próximos passos:</strong></p>
      <ul>
        <li>A nossa equipa irá analisar o seu pedido</li>
        <li>Entraremos em contacto consigo nas próximas 24-48 horas</li>
        <li>Pode responder a este email se tiver questões adicionais</li>
      </ul>

      <div style="margin-top: 30px; padding: 20px; background: #007acc; color: white; border-radius: 5px;">
        <h3 style="margin: 0; color: white;">Prismas33</h3>
        <p style="margin: 10px 0;">Transformamos ideias em soluções digitais</p>
        <p style="margin: 0;">📧 geral.prismas@gmail.com</p>
      </div>

      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Este é um email automático. Para questões urgentes, responda diretamente a este email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: data.clientEmail,
    subject,
    html
  });
}

// Enviar ambos os emails (admin + cliente)
export async function sendProjectContactEmails(data: {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  projectType: string;
  message: string;
  messageId: string;
  isNewClient: boolean;
}): Promise<{ adminSent: boolean; clientSent: boolean }> {
  
  console.log('📧 Enviando emails para projeto:', data.projectType);

  const [adminSent, clientSent] = await Promise.all([
    sendAdminNotification(data),
    sendClientConfirmation(data)
  ]);

  console.log('📧 Resultado:', {
    admin: adminSent ? '✅' : '❌',
    cliente: clientSent ? '✅' : '❌'
  });

  return { adminSent, clientSent };
}

// Verificar configuração
export function isEmailConfigured(): boolean {
  return !!(EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass);
}

// Testar configuração
export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!isEmailConfigured()) {
      console.error('❌ Email não configurado');
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Conexão de email verificada');
    return true;
  } catch (error: any) {
    console.error('❌ Erro na conexão de email:', error.message);
    return false;
  }
}
