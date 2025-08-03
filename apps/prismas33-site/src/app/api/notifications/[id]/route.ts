import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { read, status } = body;
    
    console.log(`📝 API: Atualizando notificação ${id} - read: ${read}, status: ${status}`);
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Suportar tanto o novo campo 'read' quanto o antigo 'status'
    if (typeof read === 'boolean') {
      updateData.read = read;
    }
    
    if (status) {
      // Validar status se fornecido
      const validStatuses = ['pending', 'contacted', 'converted', 'ignored'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          success: false,
          error: 'Status inválido'
        }, { status: 400 });
      }
      updateData.status = status;
    }
    
    const notificationRef = adminDb.collection('admin_notifications').doc(id);
    await notificationRef.update(updateData);
    
    console.log(`✅ API: Notificação ${id} atualizada com sucesso`);
    
    return NextResponse.json({
      success: true,
      message: 'Notificação atualizada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao atualizar notificação:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
