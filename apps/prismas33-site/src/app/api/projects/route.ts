import { NextRequest, NextResponse } from 'next/server';
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export async function GET() {
  try {
    // Verificar se o Firebase Admin está configurado corretamente
    if (!isFirebaseAdminConfigured() || !adminDb) {
      console.warn('⚠️ Firebase Admin SDK não configurado - retornando array vazio');
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        warning: 'Firebase Admin não configurado. Configure as variáveis de ambiente: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL'
      });
    }

    const projectsRef = adminDb.collection('projects');
    const snapshot = await projectsRef.orderBy('createdAt', 'desc').get();
    
    const projects = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
      };
    });
    
    console.log('✅ Projetos carregados com sucesso:', projects.length);
    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao buscar projetos:', error);
    
    return NextResponse.json({
      success: false,
      error: `Erro ao buscar projetos: ${error.message || 'Erro desconhecido'}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, images, features, demoUrl, status } = body;
    
    // Validações básicas
    if (!name || !description || !category || !status) {
      return NextResponse.json({
        success: false,
        error: 'Nome, descrição, categoria e status são obrigatórios'
      }, { status: 400 });
    }
    
    const projectData = {
      name,
      description,
      category,
      images: images || [],
      features: features || [],
      demoUrl: demoUrl || '',
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await adminDb.collection('projects').add(projectData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...projectData },
      message: 'Projeto criado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao criar projeto:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
