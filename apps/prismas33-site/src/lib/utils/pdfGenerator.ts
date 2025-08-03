// Gerador de PDF para propostas
import jsPDF from 'jspdf';

export interface ProposalData {
  id: string;
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
  }>;
  validUntil?: Date;
  validDays?: number;
  notes?: string;
  createdAt?: Date;
}

export interface ClientData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  clientAddress?: string;
}

// Função para gerar PDF real com jsPDF
export async function createProposalPDF(proposalData: ProposalData, clientData: ClientData): Promise<Buffer> {
  try {
    const doc = new jsPDF();
    
    // Configurações iniciais
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Header - Logo/Nome da empresa
    doc.setFillColor(102, 126, 234); // Cor Prismas33
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('PRISMAS33', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Desenvolvimento Digital', pageWidth / 2, 32, { align: 'center' });

    yPosition = 60;

    // Título da proposta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPOSTA COMERCIAL', margin, yPosition);
    yPosition += 20;

    // Informações do cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(clientData.clientName, margin + 25, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(clientData.clientEmail, margin + 25, yPosition);
    yPosition += 8;

    if (clientData.clientPhone) {
      doc.setFont('helvetica', 'bold');
      doc.text('Telefone:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(clientData.clientPhone, margin + 30, yPosition);
      yPosition += 8;
    }

    if (clientData.clientCompany) {
      doc.setFont('helvetica', 'bold');
      doc.text('Empresa:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(clientData.clientCompany, margin + 30, yPosition);
      yPosition += 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Data:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('pt-PT'), margin + 25, yPosition);
    yPosition += 20;

    // Linha separadora
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Título do projeto
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text(proposalData.title || 'Desenvolvimento de Projeto', margin, yPosition);
    yPosition += 15;

    // Descrição
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const description = proposalData.description || 'Desenvolvimento de solução digital personalizada';
    const splitDescription = doc.splitTextToSize(description, pageWidth - 2 * margin);
    doc.text(splitDescription, margin, yPosition);
    yPosition += splitDescription.length * 6 + 10;

    // Itens da proposta
    if (proposalData.items && proposalData.items.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('Itens da Proposta:', margin, yPosition);
      yPosition += 15;

      // Cabeçalho da tabela
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(102, 126, 234);
      doc.rect(margin, yPosition - 6, pageWidth - 2 * margin, 12, 'F');
      
      doc.text('Item', margin + 2, yPosition);
      doc.text('Qtd', margin + 80, yPosition);
      doc.text('Preço Unit.', margin + 100, yPosition);
      doc.text('Total', margin + 140, yPosition);
      yPosition += 10;

      // Itens
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      let totalValue = 0;

      proposalData.items.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        totalValue += itemTotal;

        // Linha zebrada
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPosition - 6, pageWidth - 2 * margin, 10, 'F');
        }

        doc.text(item.name, margin + 2, yPosition);
        doc.text(item.quantity.toString(), margin + 80, yPosition);
        doc.text(`€${item.price.toFixed(2)}`, margin + 100, yPosition);
        doc.text(`€${itemTotal.toFixed(2)}`, margin + 140, yPosition);
        yPosition += 10;

        // Descrição do item (se houver)
        if (item.description) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const splitItemDesc = doc.splitTextToSize(item.description, 60);
          doc.text(splitItemDesc, margin + 2, yPosition);
          yPosition += splitItemDesc.length * 4 + 2;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
        }
      });

      // Total
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(102, 126, 234);
      doc.setTextColor(255, 255, 255);
      doc.rect(margin + 100, yPosition - 8, pageWidth - margin - 100, 15, 'F');
      doc.text(`TOTAL: €${totalValue.toFixed(2)}`, margin + 105, yPosition);
      yPosition += 20;
    } else if (proposalData.value) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('Valor Total:', margin, yPosition);
      doc.text(`€${proposalData.value.toFixed(2)}`, margin + 50, yPosition);
      yPosition += 20;
    }

    // Validade
    const validUntil = proposalData.validUntil || 
      (proposalData.validDays ? new Date(Date.now() + proposalData.validDays * 24 * 60 * 60 * 1000) : null);
    
    if (validUntil) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Proposta válida até:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(validUntil).toLocaleDateString('pt-PT'), margin + 60, yPosition);
      yPosition += 15;
    }

    // Observações
    if (proposalData.notes) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      doc.text('Observações:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const splitNotes = doc.splitTextToSize(proposalData.notes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, yPosition);
      yPosition += splitNotes.length * 5 + 15;
    }

    // Footer
    const footerY = pageHeight - 40;
    doc.setDrawColor(102, 126, 234);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('Prismas33 - Desenvolvimento Digital', pageWidth / 2, footerY + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Email: info@prismas33.com | Website: www.prismas33.com', pageWidth / 2, footerY + 18, { align: 'center' });

    // Converter para Buffer
    const pdfBytes = doc.output('arraybuffer');
    return Buffer.from(pdfBytes);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    // Fallback para texto simples
    return createSimplePDF(proposalData, clientData);
  }
}

// Função de fallback que cria um PDF simples
function createSimplePDF(proposalData: ProposalData, clientData: ClientData): Buffer {
  const pdfContent = `
PROPOSTA COMERCIAL - PRISMAS33
==============================

Cliente: ${clientData.clientName}
Email: ${clientData.clientEmail}
Data: ${new Date().toLocaleDateString('pt-PT')}

-------------------------------

Projeto: ${proposalData.title || 'Desenvolvimento de Projeto'}

Descrição:
${proposalData.description || 'Desenvolvimento de solução digital personalizada'}

${proposalData.items ? `
Itens:
${proposalData.items.map(item => 
  `- ${item.name}: ${item.quantity}x €${item.price} = €${item.quantity * item.price}`
).join('\n')}

Total: €${proposalData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)}
` : proposalData.value ? `
Valor Total: €${proposalData.value}
` : ''}

${proposalData.validUntil ? `
Válida até: ${new Date(proposalData.validUntil).toLocaleDateString('pt-PT')}
` : ''}

${proposalData.notes ? `
Observações:
${proposalData.notes}
` : ''}

-------------------------------

Atenciosamente,
Equipe Prismas33
info@prismas33.com
www.prismas33.com
  `;

  return Buffer.from(pdfContent, 'utf-8');
}

// Função para criar template HTML personalizado
export function createProposalHTML(proposalData: ProposalData, clientData: ClientData): string {
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposta - ${proposalData.title}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .client-info {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin-bottom: 30px;
        }
        .proposal-title {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .items-table th {
            background: #667eea;
            color: white;
        }
        .total {
            background: #667eea;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PRISMAS33</h1>
        <p>Desenvolvimento Digital</p>
    </div>

    <div class="client-info">
        <h2>Proposta para:</h2>
        <p><strong>${clientData.clientName}</strong></p>
        <p>${clientData.clientEmail}</p>
        ${clientData.clientCompany ? `<p>${clientData.clientCompany}</p>` : ''}
        ${clientData.clientPhone ? `<p>Telefone: ${clientData.clientPhone}</p>` : ''}
    </div>

    <h2 class="proposal-title">${proposalData.title || 'Proposta de Desenvolvimento'}</h2>

    <div>
        <h3>Descrição do Projeto:</h3>
        <p>${proposalData.description || 'Desenvolvimento de solução digital personalizada conforme especificações do cliente.'}</p>
    </div>

    ${proposalData.items && proposalData.items.length > 0 ? `
    <h3>Itens da Proposta:</h3>
    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>Preço Unitário</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${proposalData.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.description || '-'}</td>
                <td>${item.quantity}</td>
                <td>€${item.price.toFixed(2)}</td>
                <td>€${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : ''}

    <div class="total">
        VALOR TOTAL: €${proposalData.value ? proposalData.value.toFixed(2) : 
          proposalData.items ? proposalData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2) : '0.00'}
    </div>

    ${proposalData.validUntil ? `
    <p><strong>Proposta válida até:</strong> ${new Date(proposalData.validUntil).toLocaleDateString('pt-PT')}</p>
    ` : ''}

    ${proposalData.notes ? `
    <div>
        <h3>Observações:</h3>
        <p>${proposalData.notes}</p>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>Prismas33 - Desenvolvimento Digital</strong></p>
        <p>Email: info@prismas33.com | Website: www.prismas33.com</p>
        <p>Proposta gerada em ${new Date().toLocaleDateString('pt-PT')}</p>
    </div>
</body>
</html>
  `;
}
