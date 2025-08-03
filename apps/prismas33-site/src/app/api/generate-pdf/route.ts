import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { createProposalPDF } from "@/lib/utils/pdfGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposalId, clientName, clientEmail } = body;

    // Validar dados obrigatórios
    if (!proposalId || !clientName || !clientEmail) {
      return NextResponse.json({
        success: false,
        error: "Dados obrigatórios em falta"
      }, { status: 400 });
    }

    // Buscar dados da proposta
    const proposalDoc = await adminDb.collection('proposals').doc(proposalId).get();
    
    if (!proposalDoc.exists) {
      return NextResponse.json({
        success: false,
        error: "Proposta não encontrada"
      }, { status: 404 });
    }

    const proposalData = {
      id: proposalDoc.id,
      ...proposalDoc.data()
    };

    // Gerar PDF da proposta
    const pdfBuffer = await createProposalPDF(proposalData, {
      clientName,
      clientEmail
    });

    // Retornar o PDF como resposta
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposta-${proposalData.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'projeto'}.pdf"`
      }
    });

  } catch (error: any) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Erro interno do servidor"
    }, { status: 500 });
  }
}
