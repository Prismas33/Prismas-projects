import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const proposalsRef = adminDb.collection('proposals');
    const snapshot = await proposalsRef.orderBy('createdAt', 'desc').get();
    
    const proposals = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        validUntil: data.validUntil?.toDate()?.toISOString() || new Date().toISOString(),
        sentAt: data.sentAt?.toDate()?.toISOString() || undefined,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
      };
    });
    
    return NextResponse.json({
      success: true,
      data: proposals,
      count: proposals.length
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao buscar propostas:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, title, description, items, totalValue, status, validUntil, notes } = body;
    
    // Validações básicas
    if (!clientId || !title || !description || !items || !totalValue || !status || !validUntil) {
      return NextResponse.json({
        success: false,
        error: 'Todos os campos obrigatórios devem ser preenchidos'
      }, { status: 400 });
    }
    
    const proposalData = {
      clientId,
      title,
      description,
      items,
      totalValue,
      status,
      validUntil: new Date(validUntil),
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await adminDb.collection('proposals').add(proposalData);
    
    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...proposalData },
      message: 'Proposta criada com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ API: Erro ao criar proposta:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
