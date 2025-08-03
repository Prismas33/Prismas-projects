import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, reply, type = 'contact' } = body;
    
    // Determinar a coleção com base no tipo
    let collection = 'contact_messages';
    if (type === 'project') {
      collection = 'project_messages';
    }
    
    const messageRef = adminDb.collection(collection).doc(id);
    const messageDoc = await messageRef.get();
    
    if (!messageDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Mensagem não encontrada'
      }, { status: 404 });
    }
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (status) {
      const validStatuses = ['pending', 'read', 'replied', 'archived'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          success: false,
          error: 'Status inválido'
        }, { status: 400 });
      }
      updateData.status = status;
    }
    
    if (reply) {
      updateData.reply = reply;
      updateData.repliedAt = new Date();
      updateData.status = 'replied';
    }
    
    await messageRef.update(updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Mensagem atualizada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao atualizar mensagem:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'project' | 'contact';
    const messageId = params.id;
    
    if (!messageId || !type || (type !== 'project' && type !== 'contact')) {
      return NextResponse.json({
        success: false,
        error: 'ID da mensagem e tipo são obrigatórios.'
      }, { status: 400 });
    }
    
    // Determinar a coleção baseada no tipo de mensagem
    const collectionName = type === 'project' ? 'project_messages' : 'contact_messages';
    
    // Verificar se a mensagem existe
    const messageRef = adminDb.collection(collectionName).doc(messageId);
    const messageSnap = await messageRef.get();
    
    if (!messageSnap.exists) {
      return NextResponse.json({
        success: false,
        error: 'Mensagem não encontrada.'
      }, { status: 404 });
    }
    
    // Excluir a mensagem
    await messageRef.delete();
    
    return NextResponse.json({
      success: true
    });
    
  } catch (error: any) {
    console.error('Erro ao excluir mensagem:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
