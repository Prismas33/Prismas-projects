import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const clientsRef = adminDb.collection('clients');
    const snapshot = await clientsRef.orderBy('lastContact', 'desc').get();
    
    const clients = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastContact: data.lastContact?.toDate()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
      };
    });
    
    return NextResponse.json({
      success: true,
      data: clients,
      count: clients.length
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao buscar clientes:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, status, source, notes } = body;
    
    // Validações básicas
    if (!name || !email || !status || !source) {
      return NextResponse.json({
        success: false,
        error: 'Nome, email, status e source são obrigatórios'
      }, { status: 400 });
    }
    
    const clientData = {
      name,
      email,
      phone: phone || '',
      company: company || '',
      status,
      source,
      notes: notes || '',
      lastContact: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      proposalsSent: 0,
      projectsCompleted: 0,
      totalValue: 0
    };
    
    const docRef = await adminDb.collection('clients').add(clientData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...clientData },
      message: 'Cliente criado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao criar cliente:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
