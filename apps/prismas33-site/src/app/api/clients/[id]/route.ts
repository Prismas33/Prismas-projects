import { NextRequest, NextResponse } from 'next/server';
import { 
  doc, 
  updateDoc,
  deleteDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const clientRef = doc(db, "clients", id);
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    // Remover campos que não devem ser atualizados diretamente
    delete updateData.id;
    delete updateData.createdAt;
    
    await updateDoc(clientRef, updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Cliente atualizado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao atualizar cliente:', error);
    
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
    
    await deleteDoc(doc(db, "clients", id));
    
    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao deletar cliente:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
