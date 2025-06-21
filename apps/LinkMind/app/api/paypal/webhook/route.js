import { updateDoc, doc, query, collection, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase/config";
import { enviarEmailBoasVindasEmailJS, enviarEmailFaturaEmailJS } from "../../../../lib/email/emailServiceEmailJS";

export async function POST(request) {
  try {
    const webhook = await request.json();
    
    // Verificar tipo de evento
    const eventType = webhook.event_type;
    const subscriptionID = webhook.resource.id;
    
    console.log(`🔔 Webhook PayPal recebido: ${eventType} para subscrição ${subscriptionID}`);
    
    // Encontrar usuário com este subscriptionID
    const usersRef = collection(db, 'utilizadores');
    const q = query(usersRef, where('paypalSubscriptionId', '==', subscriptionID));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`⚠️ Usuário não encontrado para subscrição ${subscriptionID}`);
      return Response.json({ received: true });
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
      // Manipular eventos de ativação de subscrição
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' || eventType === 'BILLING.SUBSCRIPTION.CREATED') {
      console.log(`✅ Subscrição ${eventType.toLowerCase()} para usuário ${userData.nome || userData.displayName}`);
      
      // Atualizar status no Firebase
      await updateDoc(userDoc.ref, {
        paypalSubscriptionActive: true,
        subscriptionStatus: 'active',
        activatedAt: new Date(),
        hasAccess: true,
        accessReason: 'paypal_subscription'
      });
      
      // Só enviar emails quando ativada, não quando criada
      if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {        // Enviar email de boas-vindas
        try {
          await enviarEmailBoasVindasEmailJS(webhook.resource, userData);
          console.log(`📧 Email de boas-vindas enviado para ${userData.email || userData.displayName}`);
        } catch (emailError) {
          console.error('❌ Erro ao enviar email de boas-vindas:', emailError);
        }
        
        // Enviar fatura personalizada
        try {
          await enviarEmailFaturaEmailJS(webhook.resource, userData, webhook.resource);
          console.log(`🧾 Fatura enviada para ${userData.email || userData.displayName}`);
        } catch (faturaError) {
          console.error('❌ Erro ao enviar fatura:', faturaError);
        }
      }
    }
      // Manipular eventos de cancelamento/suspensão/expiração
    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || 
        eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
        eventType === 'BILLING.SUBSCRIPTION.EXPIRED' ||
        eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      
      console.log(`❌ Subscrição ${eventType.toLowerCase()} para usuário ${userData.nome || userData.displayName}`);
      
      // Atualizar status da assinatura
      await updateDoc(userDoc.ref, {
        paypalSubscriptionActive: false,
        subscriptionStatus: eventType.includes('FAILED') ? 'payment_failed' : 'cancelled',
        cancelledAt: new Date(),
        hasAccess: false,
        accessReason: null
      });
    }
    
    // Manipular eventos de pagamento (renovação)
    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      console.log(`💰 Pagamento processado para usuário ${userData.nome || userData.displayName}`);
        // Enviar fatura de renovação
      try {
        await enviarEmailFaturaEmailJS(webhook.resource, userData, webhook.resource);
        console.log(`🧾 Fatura de renovação enviada para ${userData.email || userData.displayName}`);
      } catch (faturaError) {
        console.error('❌ Erro ao enviar fatura de renovação:', faturaError);
      }
    }    
    // Confirmar recebimento do webhook
    return Response.json({ received: true, processed: eventType });
    
  } catch (error) {
    console.error("❌ Erro no webhook PayPal:", error);
    return Response.json({ 
      error: "Erro interno do servidor",
      details: error.message 
    }, { status: 500 });
  }
}
