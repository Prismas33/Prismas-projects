# 🧠 LinkMind - Usa o teu arquivo mental, sempre acessível

Uma aplicação Next.js moderna para guardar, conectar e explorar tudo o que passa pela tua mente. A tua segunda mente digital.

## ✨ Funcionalidades

### 🔐 Autenticação Segura
- Registro e login com Firebase Authentication
- Sessões seguras e persistentes
- Validação de formulários em tempo real

### 💡 Gestão de Ideias
- **Adicionar Ideias**: Capture rapidamente suas inspirações
- **Busca Inteligente**: Encontre ideias com autocomplete e filtros
- **Categorização**: Organize por categorias (Tecnologia, Negócios, Criativo, etc.)
- **Prioridades**: Defina níveis de prioridade (Alta, Média, Baixa)
- **Datas**: Acompanhe cronogramas com datas de início e fim

### 🎨 Design Moderno
- Interface mobile-first responsiva
- Paleta de cores cuidadosamente selecionada
- Animações suaves e micro-interações
- Componentes reutilizáveis

### 📱 PWA Ready
- Service Worker configurado
- Instalável em dispositivos móveis
- Funciona offline (básico)

## 🎨 Paleta de Cores

```css
:root {
  --azul-profundo: #2A3F9E;   /* Azul principal */
  --roxo-eletrico: #7B4BFF;   /* Roxo destaque */
  --prata: #C0C0C0;           /* Cinza neutro */
  --verde-floresta: #2E8B57;  /* Verde sucesso */
  --dourado: #FFD700;         /* Dourado ações */
}
```

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- Conta Firebase

### Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd LinkMind
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**

Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e configure:

- **Authentication**: Ative Email/Password
- **Firestore**: Crie database em modo de teste
- **Regras do Firestore**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilizadores só podem acessar seus próprios dados
    match /utilizadores/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Ideias só podem ser acessadas pelo proprietário
    match /ideias/{ideiaId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

5. **Execute o projeto**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
LinkMind/
├── app/                    # App Router do Next.js 14+
│   ├── (auth)/            # Grupo de rotas de autenticação
│   │   ├── login/         # Página de login
│   │   └── registo/       # Página de registro
│   ├── adicionar-ideia/   # Página para adicionar ideias
│   ├── buscar-ideia/      # Página de busca e listagem
│   ├── dashboard/         # Dashboard principal
│   ├── layout.jsx         # Layout raiz
│   └── page.jsx          # Página inicial (landing)
├── components/            # Componentes reutilizáveis
│   ├── CardIdeia.jsx     # Card para exibir ideias
│   ├── Navbar.jsx        # Navegação principal
│   └── ServiceWorkerRegister.jsx  # Registro do PWA
├── lib/                   # Utilitários e configurações
│   ├── context/          # Contextos do React
│   │   └── AuthContext.jsx  # Contexto de autenticação
│   └── firebase/         # Configuração e funções Firebase
│       ├── auth.js       # Funções de autenticação
│       ├── config.js     # Configuração Firebase
│       └── ideias.js     # Funções CRUD de ideias
├── public/               # Arquivos estáticos
│   ├── images/          # Imagens
│   ├── logo.png         # Logo da aplicação
│   ├── manifest.json    # Manifest PWA
│   └── sw.js           # Service Worker
└── styles/              # Estilos globais
    ├── globals.css      # CSS global com Tailwind
    └── variaveis.module.css  # Variáveis CSS
```

## 🔧 Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: JavaScript/JSX
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Auth + Firestore)
- **Deployment**: Vercel (recomendado)

## 📱 Páginas Principais

### 🏠 Landing Page (`/`)
- Apresentação da aplicação
- Links para login/registro
- Redirecionamento automático se logado

### 🔐 Autenticação (`/login`, `/registo`)
- Formulários com validação
- Integração com Firebase Auth
- Feedback visual de erros/sucesso

### 🏡 Dashboard (`/dashboard`)
- Boas-vindas personalizadas
- Botões de ação principais
- Visualização das ideias recentes

### ➕ Adicionar Ideia (`/adicionar-ideia`)
- Formulário completo com validação
- Seleção de categoria e prioridade
- Datas opcionais

### 🔍 Buscar Ideia (`/buscar-ideia`)
- Busca em tempo real
- Autocomplete inteligente
- Filtros por categoria e prioridade
- Grid responsivo de resultados

## 🎯 Próximas Funcionalidades

- [ ] Edição e exclusão de ideias
- [ ] Notificações push
- [ ] Exportação de ideias
- [ ] Colaboração (partilha de ideias)
- [ ] Análise de tendências das ideias
- [ ] Integração com calendário
- [ ] Tags personalizadas
- [ ] Modo escuro
- [ ] Backup e sincronização

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Heroicons](https://heroicons.com/) - Ícones SVG

---

💡 **LinkMind** - Usa o teu arquivo mental, sempre acessível!
