import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // Obter o ID da pasta e o tipo da query
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const type = searchParams.get('type') as 'project' | 'contact';
    
    if (!type || (type !== 'project' && type !== 'contact')) {
      return NextResponse.json({
        success: false,
        error: "Tipo de mensagem inválido. Deve ser 'project' ou 'contact'."
      }, { status: 400 });
    }
    
    // Buscar mensagens
    const messagesRef = type === 'project' 
      ? adminDb.collection('project_messages')
      : adminDb.collection('contact_messages');
    
    let query = messagesRef.orderBy("createdAt", "desc");
    
    // Se tiver folderId, filtrar por pasta
    if (folderId === 'null' || folderId === '') {
      query = query.where("folderId", "==", null);
    } else if (folderId) {
      query = query.where("folderId", "==", folderId);
    }
    
    const snapshot = await query.get();
    
    const messages = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        repliedAt: data.repliedAt?.toDate()?.toISOString() || null
      };
    });
    
    return NextResponse.json({
      success: true,
      data: messages
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar mensagens por pasta:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, folderId, type } = body;
    
    // Validações básicas
    if (!messageId || !type || (type !== 'project' && type !== 'contact')) {
      return NextResponse.json({
        success: false,
        error: 'ID da mensagem e tipo são obrigatórios.'
      }, { status: 400 });
    }
    
    // Mover mensagem para pasta
    const messageRef = type === 'project' 
      ? adminDb.collection('project_messages').doc(messageId)
      : adminDb.collection('contact_messages').doc(messageId);
    
    if (folderId === null) {
      // Remover da pasta
      await messageRef.update({
        folderId: null,
        updatedAt: new Date()
      });
    } else {
      // Verificar se a pasta existe
      const folderRef = adminDb.collection('message-folders').doc(folderId);
      const folderSnap = await folderRef.get();
      
      if (!folderSnap.exists) {
        return NextResponse.json({
          success: false,
          error: 'A pasta especificada não existe.'
        }, { status: 404 });
      }
      
      const folderData = folderSnap.data();
      if (folderData?.type !== type) {
        return NextResponse.json({
          success: false,
          error: `A pasta não é compatível com mensagens de ${type}.`
        }, { status: 400 });
      }
      
      // Mover para a pasta
      await messageRef.update({
        folderId,
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({
      success: true
    });
    
  } catch (error: any) {
    console.error('Erro ao mover mensagem para pasta:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
