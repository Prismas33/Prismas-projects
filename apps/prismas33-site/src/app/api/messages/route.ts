import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const messagesRef = adminDb.collection('messages');
    const snapshot = await messagesRef.orderBy('createdAt', 'desc').get();
    
    const messages = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        repliedAt: data.repliedAt?.toDate()?.toISOString() || undefined
      };
    });
    
    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao buscar mensagens:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    // Validações básicas
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      }, { status: 400 });
    }
    
    const messageData = {
      name,
      email,
      subject,
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await adminDb.collection('messages').add(messageData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...messageData },
      message: 'Mensagem enviada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao criar mensagem:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
