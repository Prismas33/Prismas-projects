import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/services/emailServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados obrigatórios
    const { clientEmail, clientName, subject, message, originalMessage } = body;
    
    if (!clientEmail || !clientName || !subject || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, nome, assunto e mensagem são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email inválido' 
        },
        { status: 400 }
      );
    }

    // Criar HTML da resposta mais profissional
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007acc 0%, #0056b3 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 300;">Prismas33</h1>
          <p style="margin: 10px 0 0 0; color: #e3f2fd; font-size: 16px;">Resposta à sua mensagem</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Olá <strong>${clientName}</strong>,</p>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
            Obrigado por entrar em contacto connosco. Aqui está a nossa resposta à sua mensagem:
          </p>
          
          <!-- Response -->
          <div style="background: #f8f9fa; border-left: 4px solid #007acc; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #007acc; margin: 0 0 15px 0; font-size: 18px;">Nossa Resposta:</h3>
            <div style="white-space: pre-wrap; line-height: 1.6; color: #333; font-size: 15px;">${message}</div>
          </div>

          ${originalMessage ? `
          <!-- Original Message -->
          <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h4 style="color: #666; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Sua mensagem original:</h4>
            <div style="white-space: pre-wrap; color: #666; font-size: 14px; line-height: 1.5; font-style: italic;">"${originalMessage}"</div>
          </div>
          ` : ''}

          <!-- Action -->
          <div style="text-align: center; margin: 40px 0 30px 0;">
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              Precisa de esclarecimentos adicionais? Responda diretamente a este email.
            </p>
            <a href="mailto:geral.prismas@gmail.com" style="background: #007acc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-size: 14px; font-weight: 500;">
              Continuar Conversa
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 10px 0; color: #007acc; font-size: 20px;">Prismas33</h3>
          <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Transformamos ideias em soluções digitais</p>
          
          <div style="margin: 20px 0;">
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              📧 <a href="mailto:geral.prismas@gmail.com" style="color: #007acc; text-decoration: none;">geral.prismas@gmail.com</a>
            </p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              🌐 <a href="https://www.prismas33.com" style="color: #007acc; text-decoration: none;">www.prismas33.com</a>
            </p>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 20px;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              Esta resposta foi enviada automaticamente pela equipa Prismas33<br>
              Para garantir que recebe as nossas mensagens, adicione geral.prismas@gmail.com aos seus contactos.
            </p>
          </div>
        </div>
      </div>
    `;

    // Enviar email
    const success = await sendEmail({
      to: clientEmail,
      subject: `Re: ${subject}`,
      html: emailHtml
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Resposta enviada por email com sucesso!'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao enviar email. Verifique as configurações.' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Erro ao enviar resposta por email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor. Tente novamente mais tarde.' 
      },
      { status: 500 }
    );
  }
}
