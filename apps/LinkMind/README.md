# 🧠 LinkMind

Uma aplicação Progressive Web App (PWA) para gestão de informações pessoais e organização de ideias, construída com Node.js, Express e Firebase.

## 🚀 Características

- **Autenticação Segura**: Firebase Auth + Bcrypt
- **Banco de Dados**: Firestore (NoSQL)
- **PWA**: Funciona offline e pode ser instalada
- **Mobile-First**: Design responsivo otimizado para dispositivos móveis
- **Real-time Search**: Busca em tempo real com autocomplete
- **Notificações**: Push notifications e notificações locais

## 📋 Funcionalidades

### ✅ Implementadas
- [x] Sistema de autenticação (login/registro)
- [x] Dashboard com resumo de ideias
- [x] Criação de ideias com autocomplete
- [x] Busca e filtros de ideias
- [x] Design responsivo mobile-first
- [x] PWA com Service Worker
- [x] Notificações push
- [x] Armazenamento offline

### 🔄 Em Desenvolvimento
- [ ] Edição de ideias existentes
- [ ] Exclusão de ideias
- [ ] Upload de imagens
- [ ] Sincronização em background
- [ ] Categorias e tags
- [ ] Exportação de dados

## 🛠️ Tecnologias

- **Backend**: Node.js, Express.js
- **Banco de Dados**: Firebase Firestore
- **Autenticação**: Firebase Auth + Bcrypt
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **PWA**: Service Worker, Web App Manifest
- **Estilização**: CSS Grid, Flexbox, CSS Variables

## 📦 Instalação

### Pré-requisitos
- Node.js (v14+)
- NPM ou Yarn
- Conta Firebase

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd LinkMind
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração do Firebase

#### 3.1 Criar projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative Authentication (Email/Password)
4. Ative Firestore Database
5. Ative Cloud Messaging (opcional)

#### 3.2 Obter credenciais
1. Vá em "Configurações do projeto" > "Contas de serviço"
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON e renomeie para `serviceAccountKey.json`
4. Coloque o arquivo na raiz do projeto

#### 3.3 Configurar variáveis de ambiente
1. Copie o arquivo `.env.example` para `.env`
2. Preencha as variáveis com suas credenciais do Firebase:

```env
# Firebase Configuration
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id

# Server Configuration
PORT=3000
SESSION_SECRET=sua_chave_secreta_aqui

# Firebase Admin SDK
FIREBASE_DATABASE_URL=https://seu_projeto-default-rtdb.firebaseio.com
```

### 4. Executar a aplicação

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📱 PWA - Progressive Web App

A aplicação é uma PWA completa, o que significa:

- **Instalável**: Pode ser instalada no dispositivo como um app nativo
- **Offline**: Funciona mesmo sem internet (recursos em cache)
- **Responsiva**: Adapta-se a qualquer tamanho de tela
- **Segura**: Requer HTTPS em produção

### Como instalar como PWA:
1. Acesse a aplicação no navegador
2. Procure por "Instalar" ou "Adicionar à tela inicial"
3. Siga as instruções do navegador

## 🏗️ Estrutura do Projeto

```
linkmind/
├── public/                 # Arquivos estáticos
│   ├── css/
│   │   └── styles.css     # Estilos principais
│   ├── js/
│   │   └── app.js         # JavaScript principal
│   ├── images/            # Ícones e imagens
│   ├── manifest.json      # Manifest PWA
│   └── sw.js             # Service Worker
├── views/                 # Templates HTML
│   ├── login.html
│   ├── dashboard.html
│   ├── upload-mind.html
│   └── download-mind.html
├── server.js             # Servidor Express
├── package.json          # Dependências
├── .env                  # Variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
└── README.md            # Este arquivo
```

## 🔧 API Endpoints

### Autenticação
- `POST /api/register` - Registro de usuário
- `POST /api/login` - Login de usuário
- `POST /api/logout` - Logout de usuário
- `GET /api/user` - Dados do usuário logado

### Ideias
- `POST /api/ideas` - Criar nova ideia
- `GET /api/ideas` - Listar ideias do usuário
- `GET /api/ideas?search=termo` - Buscar ideias
- `GET /api/suggestions` - Obter sugestões para autocomplete

### Páginas
- `GET /` - Página de login
- `GET /dashboard` - Dashboard principal
- `GET /upload-mind` - Formulário para nova ideia
- `GET /download-mind` - Página de busca

## 🎨 Personalização

### Cores e Temas
As cores podem ser personalizadas no arquivo `public/css/styles.css` através das variáveis CSS:

```css
:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --secondary-color: #64748b;
  /* ... outras variáveis */
}
```

### Dark Mode
O dark mode é automaticamente aplicado baseado na preferência do sistema:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0f172a;
    --surface: #1e293b;
    /* ... cores para dark mode */
  }
}
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Sessões seguras com express-session
- Middleware de autenticação para rotas protegidas
- Validação de entrada em todas as APIs
- CORS configurado adequadamente

## 📱 Responsividade

O design é **mobile-first** com breakpoints:
- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: > 768px

## 🚀 Deploy

### Vercel
1. Fork este repositório
2. Conecte com Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

### Heroku
1. Crie uma app no Heroku
2. Configure as variáveis de ambiente
3. Execute: `git push heroku main`

### Firebase Hosting
1. Configure Firebase CLI
2. Execute: `firebase deploy`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 💡 Ideias Futuras

- [ ] Sistema de tags e categorias
- [ ] Compartilhamento de ideias
- [ ] Integração com calendário
- [ ] Modo colaborativo
- [ ] Exportação para PDF
- [ ] Backup automático
- [ ] Análise de produtividade
- [ ] Integração com outras apps

## 📞 Suporte

Se encontrar algum problema ou tiver sugestões:

1. Abra uma issue no GitHub
2. Descreva o problema detalhadamente
3. Inclua logs se possível

---

Feito com ❤️ para organizar suas ideias e conectar sua mente!
