// Serviço de email para envio de faturas e confirmações
export async function enviarEmailBoasVindas(subscriptionData, userData) {
  try {
    // Template de email de boas-vindas personalizado
    const emailContent = gerarTemplateBoasVindas(subscriptionData, userData);
    
    // Aqui você pode integrar com SendGrid, Nodemailer, ou outro provedor
    // Por enquanto, vou simular o envio e logar
    console.log('📧 Enviando email de boas-vindas:', {
      to: userData.email,
      subscription: subscriptionData.id,
      plan: subscriptionData.plan_id
    });
    
    // Integração futura com SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: userData.email,
      from: 'noreply@linkmind.app',
      subject: 'Bem-vindo ao LinkMind Premium! 🚀',
      html: emailContent
    };
    
    await sgMail.send(msg);
    */
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    return { success: false, error };
  }
}

export async function enviarEmailFatura(subscriptionData, userData, transactionData) {
  try {
    const faturaContent = gerarTemplateFatura(subscriptionData, userData, transactionData);
    
    console.log('📧 Enviando fatura personalizada:', {
      to: userData.email,
      subscription: subscriptionData.id,
      amount: transactionData?.amount || 'N/A'
    });
    
    // Template para fatura/recibo personalizado
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar fatura:', error);
    return { success: false, error };
  }
}

function gerarTemplateBoasVindas(subscriptionData, userData) {
  const planName = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? 'Mensal' : 'Anual';
  const planPrice = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? '€5/mês' : '€50/ano';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7B4BFF, #FFD700); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #7B4BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Bem-vindo ao LinkMind Premium!</h1>
          <p>A sua mente digital acaba de ser desbloqueada</p>
        </div>
        
        <div class="content">
          <h2>Olá ${userData.nome || userData.displayName}!</h2>
          
          <p>Parabéns! A sua subscrição do LinkMind Premium foi ativada com sucesso.</p>
          
          <div style="background: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <h3>📋 Detalhes da Subscrição:</h3>
            <ul>
              <li><strong>Plano:</strong> ${planName} (${planPrice})</li>
              <li><strong>ID da Subscrição:</strong> ${subscriptionData.id}</li>
              <li><strong>Status:</strong> Ativo</li>
              <li><strong>Início:</strong> ${new Date().toLocaleDateString('pt-PT')}</li>
            </ul>
          </div>
          
          <h3>🎯 O que tem acesso agora:</h3>
          <ul>
            <li>✅ Upload ilimitado de arquivos</li>
            <li>✅ Organização avançada de ideias</li>
            <li>✅ Acesso completo ao sistema</li>
            <li>✅ Suporte prioritário</li>
            <li>✅ Todas as funcionalidades premium</li>
          </ul>
          
          <p>Está pronto para começar a usar a sua mente digital expandida!</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://linkmind.app'}/dashboard" class="cta-button">
              Aceder ao Dashboard 🚀
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p><strong>💡 Dica:</strong> Adicione LinkMind aos seus favoritos para acesso rápido à sua mente digital!</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Esta é uma confirmação automática da sua subscrição PayPal.</p>
          <p>LinkMind - A sua mente digital, sempre acessível</p>
          <p style="font-size: 12px; color: #999;">
            Se não solicitou esta subscrição, contacte o nosso suporte imediatamente.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function gerarTemplateFatura(subscriptionData, userData, transactionData) {
  const planName = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? 'Mensal' : 'Anual';
  const planPrice = subscriptionData.plan_id === process.env.PAYPAL_MONTHLY_PLAN_ID ? '€5.00' : '€50.00';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .invoice-header { border-bottom: 2px solid #7B4BFF; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .total { font-size: 18px; font-weight: bold; color: #7B4BFF; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f1f1f1; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="invoice-header">
          <h1 style="color: #7B4BFF;">🧾 Fatura LinkMind</h1>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-PT')}</p>
          <p><strong>Fatura #:</strong> LM-${Date.now()}</p>
        </div>
        
        <div class="invoice-details">
          <h3>Faturado a:</h3>
          <p><strong>${userData.nome || userData.displayName}</strong><br>
          ${userData.email}</p>
          
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Período</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>LinkMind Premium - Plano ${planName}</td>
                <td>${planName === 'Mensal' ? 'Mensal' : 'Anual'}</td>
                <td class="total">${planPrice}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            <p class="total">Total: ${planPrice}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #e7f3ff; border-left: 4px solid #2196F3;">
            <p><strong>Método de Pagamento:</strong> PayPal</p>
            <p><strong>ID da Transação:</strong> ${subscriptionData.id}</p>
            <p><strong>Status:</strong> Pago ✅</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Obrigado por escolher LinkMind!</p>
          <p>Esta fatura é gerada automaticamente e serve como comprovativo de pagamento.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
