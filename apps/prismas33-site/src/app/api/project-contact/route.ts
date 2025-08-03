import { NextRequest, NextResponse } from 'next/server';
import { createProjectMessage } from '@/lib/firebase/integration';
import { sendProjectContactEmails } from '@/lib/services/emailServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados obrigatórios
    const { name, email, projectType, message } = body;
    
    if (!name || !email || !projectType || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nome, email, tipo de projeto e mensagem são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email inválido' 
        },
        { status: 400 }
      );
    }

    // Preparar dados do formulário
    const formData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: body.phone?.trim() || '',
      company: body.company?.trim() || '',
      projectType: projectType.trim(),
      isNewProject: body.isNewProject || projectType === 'novo-projeto',
      message: message.trim()
    };

    // Criar mensagem no Firebase (cliente, mensagem e notificação)
    const result = await createProjectMessage(formData);

    // Enviar emails
    try {
      await sendProjectContactEmails({
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        clientCompany: formData.company,
        projectType: formData.projectType,
        message: formData.message,
        messageId: result.messageId,
        isNewClient: result.isNewClient
      });
    } catch (emailError) {
      console.error('Erro ao enviar emails:', emailError);
      // Não falha o processo se o email falhar
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      clientId: result.clientId,
      isNewClient: result.isNewClient,
      message: 'Mensagem enviada com sucesso! Entraremos em contacto em breve.'
    });

  } catch (error: any) {
    console.error('Erro ao processar mensagem de projeto:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor. Tente novamente mais tarde.' 
      },
      { status: 500 }
    );
  }
}
