import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // Obter o tipo de pasta da query
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'project' | 'contact';
    
    if (!type || (type !== 'project' && type !== 'contact')) {
      return NextResponse.json({
        success: false,
        error: "Tipo de pasta inválido. Deve ser 'project' ou 'contact'."
      }, { status: 400 });
    }
    
    // Buscar pastas de mensagens
    const foldersRef = adminDb.collection('message-folders');
    const snapshot = await foldersRef.where("type", "==", type).orderBy("name").get();
    
    const folders = [];
    
    for (const docSnapshot of snapshot.docs) {
      const folderData = docSnapshot.data();
      
      // Contar quantas mensagens estão nesta pasta
      const messagesRef = type === 'project' 
        ? adminDb.collection('project_messages')
        : adminDb.collection('contact_messages');
      
      const messagesSnapshot = await messagesRef.where("folderId", "==", docSnapshot.id).get();
      
      folders.push({
        id: docSnapshot.id,
        name: folderData.name,
        description: folderData.description || '',
        createdAt: folderData.createdAt.toDate().toISOString(),
        type: folderData.type,
        messageCount: messagesSnapshot.size
      });
    }
    
    return NextResponse.json({
      success: true,
      data: folders
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar pastas de mensagens:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type } = body;
    
    // Validações básicas
    if (!name || !type || (type !== 'project' && type !== 'contact')) {
      return NextResponse.json({
        success: false,
        error: 'Nome e tipo são obrigatórios. Tipo deve ser "project" ou "contact".'
      }, { status: 400 });
    }
    
    // Criar pasta
    const folderData = {
      name,
      description: description || '',
      type,
      createdAt: new Date()
    };
    
    const docRef = await adminDb.collection('message-folders').add(folderData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id }
    });
    
  } catch (error: any) {
    console.error('Erro ao criar pasta de mensagens:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
