import { atualizarAssinatura } from "../../../../lib/firebase/auth";
import { nomeParaIdFirestore } from "../../../../lib/firebase/utils";

export async function POST(request) {
  try {
    const { subscriptionID, planType, userDisplayName } = await request.json();

    if (!subscriptionID || !planType || !userDisplayName) {
      return Response.json({ 
        success: false, 
        error: "Dados incompletos" 
      }, { status: 400 });
    }

    // Verificar se a assinatura é válida no PayPal
    const isValid = await verifyPayPalSubscription(subscriptionID);
    
    if (!isValid) {
      return Response.json({ 
        success: false, 
        error: "Assinatura inválida no PayPal" 
      }, { status: 400 });
    }

    // Converter nome para ID do Firestore
    const nomeId = nomeParaIdFirestore(userDisplayName);

    // Atualizar status da assinatura no Firestore
    const success = await atualizarAssinatura(nomeId, subscriptionID, planType);

    if (success) {
      return Response.json({ 
        success: true, 
        message: "Assinatura ativada com sucesso" 
      });
    } else {
      return Response.json({ 
        success: false, 
        error: "Erro ao atualizar assinatura" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro na API de assinatura:", error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}

async function verifyPayPalSubscription(subscriptionID) {
  try {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

    if (!clientSecret) {
      console.warn("PayPal Client Secret não configurado, pulando verificação");
      return true; // Para desenvolvimento, aceitar sem verificação
    }

    const baseURL = environment === 'sandbox' 
      ? 'https://api.sandbox.paypal.com' 
      : 'https://api.paypal.com';

    // Obter token de acesso
    const authResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      throw new Error("Falha ao obter token PayPal");
    }

    // Verificar status da assinatura
    const subscriptionResponse = await fetch(`${baseURL}/v1/billing/subscriptions/${subscriptionID}`, {
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Accept': 'application/json'
      }
    });

    const subscriptionData = await subscriptionResponse.json();
    
    return subscriptionData.status === 'ACTIVE';

  } catch (error) {
    console.error("Erro ao verificar assinatura PayPal:", error);
    return false;
  }
}
