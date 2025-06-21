import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userDisplayName = searchParams.get('userDisplayName');

    if (!userDisplayName) {
      return NextResponse.json(
        { error: 'Nome do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados do usuário no Firebase
    const nomeId = nomeParaIdFirestore(userDisplayName);
    const userRef = doc(db, 'utilizadores', nomeId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const subscriptionId = userData.paypalSubscriptionId;

    if (!subscriptionId) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null
      });
    }

    // Buscar detalhes da assinatura no PayPal
    const accessToken = await getPayPalAccessToken();
    
    const subscriptionResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!subscriptionResponse.ok) {
      console.error('Erro ao buscar assinatura no PayPal');
      return NextResponse.json({
        hasSubscription: false,
        subscription: null
      });
    }

    const subscriptionData = await subscriptionResponse.json();

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscriptionData.id,
        status: subscriptionData.status,
        plan_id: subscriptionData.plan_id,
        start_time: subscriptionData.start_time,
        billing_info: subscriptionData.billing_info,
        subscriber: subscriptionData.subscriber,
        create_time: subscriptionData.create_time,
        update_time: subscriptionData.update_time
      }
    });

  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
