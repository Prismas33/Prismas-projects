import { NextRequest, NextResponse } from 'next/server';
import { createMessageFromForm } from '@/lib/firebase/integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados obrigatórios
    const { name, email, subject, message } = body;
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Todos os campos são obrigatórios' 
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

    // Criar mensagem no Firebase
    const messageId = await createMessageFromForm({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    });

    return NextResponse.json({
      success: true,
      messageId,
      message: 'Mensagem recebida com sucesso!'
    });

  } catch (error: any) {
    console.error('Erro ao processar mensagem de contato:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

// Endpoint para webhook do EmailJS (opcional)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Dados que chegam do EmailJS webhook
    const { from_name, from_email, subject, message, template_id } = body;
    
    if (!from_name || !from_email || !subject || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados incompletos do webhook' 
        },
        { status: 400 }
      );
    }

    // Criar mensagem no Firebase a partir do webhook
    const messageId = await createMessageFromForm({
      name: from_name,
      email: from_email,
      subject: subject,
      message: message
    });

    return NextResponse.json({
      success: true,
      messageId,
      source: 'emailjs_webhook'
    });

  } catch (error: any) {
    console.error('Erro ao processar webhook do EmailJS:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar webhook' 
      },
      { status: 500 }
    );
  }
}
