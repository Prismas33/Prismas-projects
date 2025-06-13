# 🔥 Configuração do Firebase para LinkMind

## Passo a passo para configurar o Firebase

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `linkmind` (ou outro nome de sua escolha)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Autenticação

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"
4. Ative "Email/senha"
5. Salve as alterações

### 3. Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (por enquanto)
4. Selecione uma localização próxima (ex: us-central1)
5. Clique em "Concluído"

### 4. Obter Credenciais do Admin SDK

1. Vá em "Configurações do projeto" (ícone de engrenagem)
2. Clique na aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Baixe o arquivo JSON
5. Renomeie para `serviceAccountKey.json`
6. Coloque na raiz do projeto LinkMind

### 5. Obter Configuração Web

1. Na página "Configurações do projeto"
2. Role para baixo até "Seus aplicativos"
3. Clique no ícone da web `</>`
4. Nome do app: "LinkMind Web"
5. NÃO marque "Configurar Firebase Hosting"
6. Clique em "Registrar app"
7. Copie as configurações mostradas

### 6. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com as informações obtidas:

```env
# Firebase Configuration (da etapa 5)
FIREBASE_API_KEY=AIzaSyDw5Bb-NmvR18c-G-juXal0r1TPLpwgGGE
FIREBASE_AUTH_DOMAIN=linkmind-94209.firebaseapp.com
FIREBASE_PROJECT_ID=linkmind-94209
FIREBASE_STORAGE_BUCKET=linkmind-94209.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=702458630922
FIREBASE_APP_ID=1:702458630922:web:72f0750e78b33349ace0f3
FIREBASE_MEASUREMENT_ID=G-0WE22YP9CV

# Server Configuration
PORT=3000
SESSION_SECRET=your_secret_key_here

# Firebase Admin SDK (da etapa 4)
FIREBASE_DATABASE_URL=https://linkmind-94209-default-rtdb.firebaseio.com
```

⚠️ **IMPORTANTE**: 
- As credenciais acima já estão configuradas para o projeto `linkmind-94209`
- O arquivo `firebase-config.js` automaticamente carrega essas variáveis do servidor
- Todas as páginas HTML já incluem os scripts Firebase necessários

### 7. Configurar Regras de Segurança do Firestore

No console do Firebase, vá em "Firestore Database" > "Regras" e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para ideias
    match /ideas/{ideaId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 8. (Opcional) Configurar Cloud Messaging

Para notificações push:

1. Vá em "Configurações do projeto" > "Cloud Messaging"
2. Gere as chaves do servidor
3. Adicione ao arquivo `.env`:

```env
FIREBASE_SERVER_KEY=sua_server_key_aqui
```

### 9. Arquivos de Configuração Criados

Os seguintes arquivos foram configurados automaticamente:

- **`public/js/firebase-config.js`**: Configuração principal do Firebase para o frontend
- **`public/js/firebase-test.js`**: Script de teste para verificar a configuração
- **`.env`**: Variáveis de ambiente com credenciais Firebase
- **`server.js`**: Atualizado com middleware para servir configurações Firebase

### 10. Testar a Configuração

Execute os comandos:

```bash
npm install
npm start
```

Acesse `http://localhost:3000` e teste:
1. Criar uma conta
2. Fazer login
3. Criar uma ideia
4. Buscar ideias

**Para testar a configuração Firebase:**
- Abra o Developer Tools (F12)
- Vá para a aba Console  
- Você deve ver mensagens de sucesso da inicialização do Firebase

### 11. Verificar no Console Firebase

No console Firebase, verifique se:
- Usuários aparecem em "Authentication" > "Users"
- Dados aparecem em "Firestore Database"

## 🔧 Solução de Problemas

### Erro: "Firebase Admin SDK não inicializado"
- Verifique se o arquivo `serviceAccountKey.json` está na raiz
- Confirme se as variáveis de ambiente estão corretas

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Confirme se o usuário está autenticado

### Erro: "Module not found"
- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas

### Erro: "Invalid API key"
- Verifique se as credenciais no `.env` estão corretas
- Confirme se copiou da configuração web correta

## 📚 Recursos Úteis

- [Documentação Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

✅ Após seguir todos os passos, sua aplicação LinkMind estará completamente configurada e funcional!
