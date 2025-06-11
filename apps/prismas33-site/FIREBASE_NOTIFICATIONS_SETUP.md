# Firebase Firestore - Configuração para Notificações

## 🔥 Configuração das Regras de Segurança

Para permitir que os usuários enviem notificações, você precisa configurar as regras do Firestore:

### 1. Acesse o Console do Firebase
- Vá para: https://console.firebase.google.com
- Selecione o projeto: `prismas33-1914c`
- No menu lateral, clique em **Firestore Database**

### 2. Configure as Regras
- Clique na aba **Rules**
- Substitua as regras existentes por:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to notifications collection
    match /notifications/{document} {
      allow create: if isValidNotification(resource.data);
      allow read: if false; // Users cannot read notifications (admin only)
      allow update: if false; // Users cannot update notifications
      allow delete: if false; // Users cannot delete notifications
    }
    
    // Helper function to validate notification data
    function isValidNotification(data) {
      return data.keys().hasAll(['email', 'appName', 'timestamp']) &&
             data.email is string && 
             data.appName is string &&
             data.email.matches('.*@.*\\..*') && // Basic email validation
             data.appName in ['nexus5', 'cerebra7', 'puzzle33', 'docflow4', 'linkmind'];
    }
    
    // Deny access to all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Publique as Regras
- Clique em **Publish** para ativar as novas regras

## 📊 Estrutura dos Dados Salvos

Cada notificação salva no Firestore terá a seguinte estrutura:

```json
{
  "email": "usuario@exemplo.com",
  "appName": "nexus5",
  "timestamp": "2025-01-15T10:30:00Z",
  "userAgent": "Mozilla/5.0...",
  "language": "pt-BR",
  "referrer": "https://google.com",
  "status": "pending"
}
```

## 🔍 Como Visualizar os Dados

### No Console Firebase:
1. Vá para **Firestore Database**
2. Clique na coleção **notifications**
3. Veja todos os emails coletados

### Campos Disponíveis:
- **email**: Email do usuário
- **appName**: Nome do app (nexus5, cerebra7, puzzle33, docflow4, linkmind)
- **timestamp**: Data/hora do registro
- **userAgent**: Informações do navegador
- **language**: Idioma do navegador
- **referrer**: Site de origem (se houver)
- **status**: Status da notificação (pending, sent, etc.)

## 🚀 Funcionalidades Implementadas

✅ **Integração Firebase Firestore**
- Dados salvos em tempo real na nuvem
- Backup local em localStorage
- Tratamento de erros robusto

✅ **Validação de Dados**
- Verificação de email válido
- Validação de apps permitidos
- Timestamp automático do servidor

✅ **Experience do Usuário**
- Loading state durante envio
- Feedback visual de sucesso
- Fallback para localStorage se Firebase falhar

✅ **Segurança**
- Regras restritivas no Firestore
- Usuários só podem criar, não ler/editar
- Validação server-side dos dados

## 🔧 Troubleshooting

### Erro: "Missing or insufficient permissions"
- Verifique se as regras do Firestore foram publicadas corretamente
- Confirme que a coleção se chama exatamente `notifications`

### Erro: "Firebase not available"
- Verifique se a internet está funcionando
- Confirme se o Firebase SDK carregou corretamente
- Os dados ainda são salvos localmente como backup

### Como testar:
1. Abra `index.html` no navegador
2. Clique em "Notify Me" em qualquer app (exceto SafeCallKids)
3. Digite um email válido
4. Veja no Console do Firebase se o dados foi salvo

## 📈 Próximos Passos (Opcionais)

- **Admin Dashboard**: Criar painel para visualizar/gerenciar notificações
- **Email Automation**: Integrar com serviço de email para envios automáticos
- **Analytics**: Adicionar métricas de conversão por app
- **A/B Testing**: Testar diferentes textos nos modais
