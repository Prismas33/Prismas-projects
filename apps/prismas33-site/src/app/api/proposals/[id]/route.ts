import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    // Converter validUntil se presente
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil);
    }
    
    // Converter sentAt se presente
    if (updateData.sentAt) {
      updateData.sentAt = new Date(updateData.sentAt);
    }
    
    // Remover campos que não devem ser atualizados diretamente
    delete updateData.id;
    delete updateData.createdAt;
    
    await adminDb.collection('proposals').doc(id).update(updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Proposta atualizada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao atualizar proposta:', error);
    
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
    const { id } = params;
    
    await adminDb.collection('proposals').doc(id).delete();
    
    return NextResponse.json({
      success: true,
      message: 'Proposta deletada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao deletar proposta:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
