import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description } = body;
    
    // Validações básicas
    if (!id || !name) {
      return NextResponse.json({
        success: false,
        error: 'ID da pasta e nome são obrigatórios.'
      }, { status: 400 });
    }
    
    // Verificar se a pasta existe
    const folderRef = adminDb.collection('message-folders').doc(id);
    const folderSnap = await folderRef.get();
    
    if (!folderSnap.exists) {
      return NextResponse.json({
        success: false,
        error: 'A pasta especificada não existe.'
      }, { status: 404 });
    }
    
    // Dados para atualização
    const updateData: any = {
      name,
      updatedAt: new Date()
    };
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    // Não permitir alterar o tipo da pasta
    
    // Atualizar a pasta
    await folderRef.update(updateData);
    
    return NextResponse.json({
      success: true
    });
    
  } catch (error: any) {
    console.error('Erro ao atualizar pasta de mensagens:', error);
    
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'project' | 'contact';
    
    if (!id || !type || (type !== 'project' && type !== 'contact')) {
      return NextResponse.json({
        success: false,
        error: 'ID da pasta e tipo são obrigatórios.'
      }, { status: 400 });
    }
    
    // Verificar se a pasta existe
    const folderRef = adminDb.collection('message-folders').doc(id);
    const folderSnap = await folderRef.get();
    
    if (!folderSnap.exists) {
      return NextResponse.json({
        success: false,
        error: 'A pasta especificada não existe.'
      }, { status: 404 });
    }
    
    // Verificar se a pasta está vazia
    const messagesRef = type === 'project' 
      ? adminDb.collection('project_messages')
      : adminDb.collection('contact_messages');
    
    const messagesSnapshot = await messagesRef.where("folderId", "==", id).get();
    
    if (!messagesSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Não é possível excluir uma pasta que contém mensagens.'
      }, { status: 400 });
    }
    
    // Excluir a pasta
    await folderRef.delete();
    
    return NextResponse.json({
      success: true
    });
    
  } catch (error: any) {
    console.error('Erro ao excluir pasta de mensagens:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
