import { NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase/config';
import { nomeParaIdFirestore } from '../../../../lib/firebase/utils';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const { subscriptionId, userDisplayName, reason } = await request.json();

    if (!subscriptionId || !userDisplayName) {
      return NextResponse.json(
        { error: 'ID da assinatura e nome do usuário são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter token de acesso do PayPal
    const accessToken = await getPayPalAccessToken();

    // Cancelar assinatura no PayPal
    const cancelResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        reason: reason || 'Cancelamento solicitado pelo usuário'
      })
    });

    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.json();
      console.error('Erro ao cancelar no PayPal:', errorData);
      return NextResponse.json(
        { error: 'Erro ao cancelar assinatura no PayPal' },
        { status: 500 }
      );
    }

    // Atualizar status no Firebase
    const nomeId = nomeParaIdFirestore(userDisplayName);
    const userRef = doc(db, 'utilizadores', nomeId);
    
    await updateDoc(userRef, {
      paypalSubscriptionId: null,
      paypalStatus: 'cancelled',
      subscriptionCancelledAt: new Date().toISOString(),
      hasAccess: false,
      accessReason: null
    });

    console.log(`Assinatura ${subscriptionId} cancelada para usuário ${userDisplayName}`);

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
