// Sistema de emails para responder aos clientes através da dashboard
import emailjs from '@emailjs/browser';

// Configurações do EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ol8niqo',
  TEMPLATE_ID_REPLY: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_REPLY || 'template_reply_admin',
  TEMPLATE_ID_PROPOSAL: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PROPOSAL || 'template_proposal',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'BABNdz0y37DwfGJ9P'
};

// Inicializar EmailJS
if (typeof window !== 'undefined') {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

export interface EmailReply {
  to_email: string;
  to_name: string;
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
  original_subject?: string;
  original_message?: string;
}

export interface ProposalEmail {
  to_email: string;
  to_name: string;
  client_company?: string;
  proposal_title: string;
  proposal_description: string;
  services: Array<{
    name: string;
    description: string;
    price: number;
  }>;
  total_amount: number;
  valid_until: string;
  proposal_id: string;
}

// Responder a uma mensagem de contato
export async function sendReplyEmail(replyData: EmailReply): Promise<boolean> {
  try {
    const templateParams = {
      to_email: replyData.to_email,
      to_name: replyData.to_name,
      from_name: replyData.from_name || 'Prismas33',
      from_email: replyData.from_email || 'contato@prismas33.com',
      subject: replyData.subject,
      message: replyData.message,
      original_subject: replyData.original_subject || '',
      original_message: replyData.original_message || ''
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_REPLY,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Email de resposta enviado com sucesso');
      return true;
    } else {
      console.error('❌ Erro ao enviar email:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email de resposta:', error);
    return false;
  }
}

// Enviar proposta por email
export async function sendProposalEmail(proposalData: ProposalEmail): Promise<boolean> {
  try {
    // Formatar lista de serviços
    const servicesText = proposalData.services
      .map(service => `• ${service.name}: €${service.price.toFixed(2)}\n  ${service.description}`)
      .join('\n\n');

    const templateParams = {
      to_email: proposalData.to_email,
      to_name: proposalData.to_name,
      client_company: proposalData.client_company || '',
      proposal_title: proposalData.proposal_title,
      proposal_description: proposalData.proposal_description,
      services_list: servicesText,
      total_amount: `€${proposalData.total_amount.toFixed(2)}`,
      valid_until: proposalData.valid_until,
      proposal_id: proposalData.proposal_id,
      from_name: 'Prismas33',
      from_email: 'contato@prismas33.com'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_PROPOSAL,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Proposta enviada por email com sucesso');
      return true;
    } else {
      console.error('❌ Erro ao enviar proposta:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar proposta por email:', error);
    return false;
  }
}

// Enviar email de follow-up para leads interessados
export async function sendFollowUpEmail(data: {
  to_email: string;
  to_name?: string;
  app_name: string;
  custom_message?: string;
}): Promise<boolean> {
  try {
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name || 'Interessado',
      app_name: data.app_name,
      custom_message: data.custom_message || `Obrigado pelo seu interesse na aplicação ${data.app_name}! Gostaríamos de saber mais sobre as suas necessidades e como podemos ajudar.`,
      from_name: 'Prismas33',
      from_email: 'contato@prismas33.com'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      'template_followup', // Template para follow-up
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Email de follow-up enviado com sucesso');
      return true;
    } else {
      console.error('❌ Erro ao enviar follow-up:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar follow-up:', error);
    return false;
  }
}

// Validar configuração do EmailJS
export function validateEmailJSConfig(): boolean {
  return !!(
    EMAILJS_CONFIG.SERVICE_ID &&
    EMAILJS_CONFIG.TEMPLATE_ID_REPLY &&
    EMAILJS_CONFIG.PUBLIC_KEY
  );
}

// Obter status do EmailJS
export function getEmailJSStatus(): {
  configured: boolean;
  serviceId: string;
  templatesConfigured: {
    reply: boolean;
    proposal: boolean;
  };
} {
  return {
    configured: validateEmailJSConfig(),
    serviceId: EMAILJS_CONFIG.SERVICE_ID,
    templatesConfigured: {
      reply: !!EMAILJS_CONFIG.TEMPLATE_ID_REPLY,
      proposal: !!EMAILJS_CONFIG.TEMPLATE_ID_PROPOSAL
    }
  };
}
