// Serviço de email usando EmailJS - mais simples para você que já tem conta
import emailjs from '@emailjs/browser';

// Configurações do EmailJS - usando seus dados reais
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ol8niqo'; // Gmail service
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_i0h927g'; // Seu template
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'BABNdz0y37DwfGJ9P'; // Sua public key

export async function enviarEmailBoasVindasEmailJS(subscriptionData, userData) {
  try {
    const planName = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? 'Mensal' : 'Anual';
    const planPrice = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? '€5/mês' : '€50/ano';
    
    // Template params simples para funcionar com qualquer template EmailJS
    const templateParams = {
      from_name: 'LinkMind',
      to_name: userData.nome || userData.displayName || 'Cliente',
      subject: '🚀 Bem-vindo ao LinkMind Premium!',
      message: `Parabéns! A sua subscrição do LinkMind Premium foi ativada com sucesso.

📋 Detalhes da Subscrição:
• Plano: ${planName} (${planPrice})
• ID: ${subscriptionData.id}
• Status: Ativo ✅
• Data: ${new Date().toLocaleDateString('pt-PT')}

🎯 Acesso Premium Ativado:
✅ Upload ilimitado de arquivos
✅ Organização avançada de ideias  
✅ Acesso completo ao sistema
✅ Suporte prioritário

🚀 Aceda agora: ${process.env.NEXT_PUBLIC_APP_URL || 'https://linkmind.app'}/dashboard

Obrigado por escolher LinkMind!
A sua mente digital está pronta para usar.

---
LinkMind - A sua mente digital, sempre acessível`,
      
      // Campos extras para templates avançados (opcionais)
      user_email: userData.email || userData.displayName + '@gmail.com',
      subscription_id: subscriptionData.id,
      plan_type: planName,
      dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://linkmind.app'}/dashboard`
    };

    console.log('📧 Enviando email via EmailJS...', {
      service: EMAILJS_SERVICE_ID,
      template: EMAILJS_TEMPLATE_ID,
      to: userData.nome || userData.displayName
    });

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email enviado com sucesso:', response.status, response.text);
    return { success: true, response };
    
  } catch (error) {
    console.error('❌ Erro ao enviar email via EmailJS:', error);
    return { success: false, error };
  }
}

export async function enviarEmailFaturaEmailJS(subscriptionData, userData, transactionData) {
  try {
    const planName = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? 'Mensal' : 'Anual';
    const planPrice = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? '€5.00' : '€50.00';
    const invoiceNumber = `LM-${Date.now()}`;
    
    const templateParams = {
      from_name: 'LinkMind - Faturação',
      to_name: userData.nome || userData.displayName || 'Cliente',
      subject: `🧾 Fatura LinkMind #${invoiceNumber}`,
      message: `FATURA LINKMIND
Fatura #: ${invoiceNumber}
Data: ${new Date().toLocaleDateString('pt-PT')}

CLIENTE:
${userData.nome || userData.displayName}
${userData.email || 'Email não disponível'}

SERVIÇO:
LinkMind Premium - Plano ${planName}
Período: ${planName === 'Mensal' ? 'Mensal' : 'Anual'}
Valor: ${planPrice}

PAGAMENTO:
Método: PayPal ✅
Transação: ${subscriptionData.id}
Status: Pago

TOTAL: ${planPrice}

Obrigado por escolher LinkMind!
Esta fatura serve como comprovativo de pagamento.

---
LinkMind - A sua mente digital, sempre acessível`,

      // Campos extras para templates avançados
      user_email: userData.email || userData.displayName + '@gmail.com',
      invoice_number: invoiceNumber,
      amount: planPrice,
      transaction_id: subscriptionData.id
    };

    console.log('🧾 Enviando fatura via EmailJS...', {
      service: EMAILJS_SERVICE_ID,
      invoice: invoiceNumber,
      to: userData.nome || userData.displayName
    });

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Fatura enviada com sucesso:', response.status, response.text);
    return { success: true, response };
    
  } catch (error) {
    console.error('❌ Erro ao enviar fatura via EmailJS:', error);
    return { success: false, error };
  }
}

// Função para validar configuração do EmailJS
export function validarConfiguracaoEmailJS() {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('⚠️ EmailJS não está completamente configurado. Verifique as variáveis de ambiente.');
    return false;
  }
  return true;
}
