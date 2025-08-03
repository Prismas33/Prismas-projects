import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { createProposalPDF } from "@/lib/utils/pdfGenerator";
import { sendEmailWithDetails } from "@/lib/services/emailServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, proposalId, clientEmail, clientName, subject, messageText } = body;

    // Validar dados obrigatórios
    if (!messageId || !proposalId || !clientEmail || !clientName) {
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

    // Preparar dados do email
    const emailData = {
      to: clientEmail,
      subject: subject || `Proposta - ${proposalData.title || 'Projeto'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Prismas33</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Desenvolvimento Digital</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá ${clientName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${messageText || 'Segue em anexo a proposta para o seu projeto.'}
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 10px 0;">${proposalData.title || 'Proposta de Projeto'}</h3>
              ${proposalData.description ? `<p style="color: #666; margin: 0;">${proposalData.description}</p>` : ''}
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Por favor, reveja a proposta em anexo e não hesite em contactar-nos caso tenha alguma questão.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              Cumprimentos,<br>
              <strong>Equipe Prismas33</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Prismas33 - Desenvolvimento Digital<br>
              Email: info@prismas33.com | Website: www.prismas33.com
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `proposta-${proposalData.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'projeto'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Enviar email
    const emailResult = await sendEmailWithDetails(emailData);

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: "Erro ao enviar email: " + emailResult.error
      }, { status: 500 });
    }

    // Registrar o envio da proposta na mensagem
    await adminDb.collection('project_messages').doc(messageId).update({
      proposalSent: true,
      proposalSentAt: new Date(),
      proposalId: proposalId,
      status: 'quoted',
      updatedAt: new Date()
    });

    // Criar registro de envio de proposta
    await adminDb.collection('proposal_sends').add({
      messageId,
      proposalId,
      clientEmail,
      clientName,
      sentAt: new Date(),
      emailMessageId: emailResult.messageId || null
    });

    return NextResponse.json({
      success: true,
      message: "Proposta enviada com sucesso"
    });

  } catch (error: any) {
    console.error("Erro ao enviar proposta:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Erro interno do servidor"
    }, { status: 500 });
  }
}
