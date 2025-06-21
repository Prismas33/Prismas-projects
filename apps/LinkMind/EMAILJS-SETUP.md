# Configuração do EmailJS - Usando seu template existente

## ✅ Configuração atual detectada:
- **Service ID:** `service_ol8niqo` (Gmail conectado ✅)
- **Template ID:** `template_i0h927g` 
- **Email:** `geral.prismas@gmail.com`

## 🔧 Como usar seu template existente:

### Opção 1: Usar template simples (RECOMENDADO)
O código já está configurado para funcionar com qualquer template EmailJS básico que tenha estas variáveis:

```
{{from_name}} - Nome do remetente
{{to_name}} - Nome do destinatário  
{{subject}} - Assunto do email
{{message}} - Mensagem principal
```

### Opção 2: Template avançado (OPCIONAL)
Se quiser um template mais elaborado, edite seu template `template_i0h927g` e adicione:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #7B4BFF, #FFD700); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; color: #666; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
        </div>
        <div class="content">
            <p>Olá {{to_name}},</p>
            <div style="white-space: pre-line;">{{message}}</div>
            
            <!-- Dados específicos da subscrição (opcionais) -->
            {{#subscription_id}}
            <div style="background: #e8f5e8; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                <strong>ID da Subscrição:</strong> {{subscription_id}}<br>
                <strong>Plano:</strong> {{plan_type}}<br>
                {{#dashboard_url}}
                <a href="{{dashboard_url}}" style="display: inline-block; background: #7B4BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    Aceder ao Dashboard 🚀
                </a>
                {{/dashboard_url}}
            </div>
            {{/subscription_id}}
            
            {{#invoice_number}}
            <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <strong>Fatura:</strong> {{invoice_number}}<br>
                <strong>Valor:</strong> {{amount}}<br>
                <strong>ID Transação:</strong> {{transaction_id}}
            </div>
            {{/invoice_number}}
        </div>
        <div class="footer">
            <p>Enviado por {{from_name}}</p>
            <p style="font-size: 12px; color: #999;">
                LinkMind - A sua mente digital, sempre acessível
            </p>
        </div>
    </div>
</body>
</html>
```

## 🔧 Variáveis do Template:

### Campos obrigatórios:
- `{{to_name}}` - Nome do destinatário
- `{{to_email}}` - Email do destinatário  
- `{{from_name}}` - Nome do remetente
- `{{subject}}` - Assunto do email
- `{{message}}` - Mensagem principal

### Campos opcionais (subscrição):
- `{{subscription_id}}` - ID da subscrição PayPal
- `{{plan_type}}` - Tipo de plano (Mensal/Anual)
- `{{dashboard_url}}` - Link para o dashboard

### Campos opcionais (fatura):
- `{{invoice_number}}` - Número da fatura
- `{{amount}}` - Valor pago
- `{{transaction_id}}` - ID da transação

## � PRONTO PARA USAR!

### O sistema já está configurado e funcionando:

1. **✅ Service conectado:** Gmail service `service_ol8niqo`
2. **✅ Template configurado:** `template_i0h927g`
3. **✅ Código atualizado:** Para usar suas configurações

### 📋 Para testar:

```bash
# 1. Vá para PayPal Developer Console
# 2. Configure o webhook com estes eventos:
# - BILLING.SUBSCRIPTION.ACTIVATED
# - BILLING.SUBSCRIPTION.CANCELLED
# - BILLING.SUBSCRIPTION.CREATED

# 3. URL do webhook:
https://seu-dominio.com/api/paypal/webhook

# 4. Faça uma subscrição teste
# 5. Verifique os logs do console
# 6. Confirme se o email chegou
```

### 🔍 Logs para monitorar:

```javascript
// No console você verá:
📧 Enviando email via EmailJS...
✅ Email enviado com sucesso: 200 OK
🧾 Enviando fatura via EmailJS...
✅ Fatura enviada com sucesso: 200 OK
```

### ⚙️ Variáveis enviadas para seu template:

```javascript
{
  from_name: "LinkMind",
  to_name: "Nome do Cliente", 
  subject: "🚀 Bem-vindo ao LinkMind Premium!",
  message: "Mensagem completa formatada...",
  user_email: "email@cliente.com",
  subscription_id: "PayPal_ID",
  plan_type: "Mensal/Anual",
  dashboard_url: "link_dashboard"
}
```

## 💡 Dica importante:
Se seu template atual não funcionar, crie um template simples no EmailJS com este conteúdo:

```html
<p>De: {{from_name}}</p>
<p>Para: {{to_name}}</p>
<h2>{{subject}}</h2>
<div style="white-space: pre-line;">{{message}}</div>

{{#subscription_id}}
<hr>
<p><strong>ID Subscrição:</strong> {{subscription_id}}</p>
<p><strong>Plano:</strong> {{plan_type}}</p>
<a href="{{dashboard_url}}">Aceder ao Dashboard</a>
{{/subscription_id}}
```

## 🎯 Template mínimo que sempre funciona:
```html
<h2>{{subject}}</h2>
<p>Olá {{to_name}},</p>
<div>{{message}}</div>
<p>Atenciosamente,<br>{{from_name}}</p>
```

## ✅ Eventos PayPal configurados:

Para ativar no webhook PayPal, marque estes eventos:
- ✅ `BILLING.SUBSCRIPTION.ACTIVATED`
- ✅ `BILLING.SUBSCRIPTION.CANCELLED`
- ✅ `BILLING.SUBSCRIPTION.CREATED`
- ✅ `BILLING.SUBSCRIPTION.SUSPENDED`
- ✅ `BILLING.SUBSCRIPTION.EXPIRED`
- ✅ `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
- ✅ `PAYMENT.SALE.COMPLETED`

## 🚀 Como testar:

1. Crie uma subscrição teste no PayPal
2. Verifique os logs do console para ver se o webhook está funcionando
3. Confirme se os emails chegam na caixa de entrada
4. Teste tanto email de boas-vindas quanto fatura
