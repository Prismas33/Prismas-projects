import { updateDoc, doc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase/config";

export async function POST(request) {
  try {
    const webhook = await request.json();
    
    // Verificar tipo de evento
    const eventType = webhook.event_type;
    
    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || 
        eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
        eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
      
      const subscriptionID = webhook.resource.id;
      
      // Encontrar usuário com este subscriptionID
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('subscriptionID', '==', subscriptionID));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        
        // Atualizar status da assinatura
        await updateDoc(userDoc.ref, {
          paypalSubscriptionActive: false,
          subscriptionStatus: 'cancelled',
          cancelledAt: new Date()
        });
        
        console.log(`Assinatura ${subscriptionID} cancelada para usuário ${userDoc.id}`);
      }
    }
    
    // Confirmar recebimento do webhook
    return Response.json({ received: true });
    
  } catch (error) {
    console.error("Erro no webhook PayPal:", error);
    return Response.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}
