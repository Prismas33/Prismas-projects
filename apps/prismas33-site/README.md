# 🚀 Prismas33 Admin Dashboard

Sistema completo de gestão empresarial para a Prismas33, incluindo dashboard administrativa, CRM, gestão de projetos, e integração com formulários do site público.

## 📸 Preview

```
🏠 Site Público (/)
├── 📱 Portfólio de Apps
├── 📞 Formulário de Contato
└── 🔔 Formulário de Interesse

🔐 Dashboard Admin (/admin)
├── 📊 Dashboard Principal
├── 💼 Gestão de Projetos
├── 📧 Sistema de Mensagens
├── 🔔 Notificações
├── 👥 CRM - Clientes
└── 📋 Propostas
```

## ✨ Funcionalidades

### 🌐 Site Público
- **Portfólio Interativo**: Exibição dos projetos da Prismas33
- **Formulário de Contato**: Integrado com sistema de mensagens admin
- **Formulário de Interesse**: Para registro de interesse nas aplicações
- **Design Responsivo**: Compatível com todos os dispositivos

### 🔐 Dashboard Admin
- **Autenticação Segura**: Apenas emails autorizados podem aceder
- **Dashboard Principal**: Estatísticas e visão geral do negócio
- **Gestão de Projetos**: CRUD completo para portfólio
- **Sistema de Mensagens**: Receber e responder mensagens de contacto
- **Gestão de Notificações**: Acompanhamento de interesse nas apps
- **CRM Completo**: Gestão de clientes e histórico
- **Gestão de Propostas**: Criação, envio e acompanhamento

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify

## 📦 Estrutura do Projeto

```
prismas33-site/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📄 page.tsx              # Página principal
│   │   ├── 📄 layout.tsx            # Layout global
│   │   ├── 📁 admin/                # Área administrativa
│   │   │   ├── 📄 layout.tsx        # Layout admin
│   │   │   ├── 📁 dashboard/        # Dashboard principal
│   │   │   ├── 📁 projects/         # Gestão de projetos
│   │   │   ├── 📁 messages/         # Sistema de mensagens
│   │   │   ├── 📁 notifications/    # Gestão de notificações
│   │   │   ├── 📁 clients/          # CRM - Clientes
│   │   │   └── 📁 proposals/        # Gestão de propostas
│   │   └── 📁 safecallkids/         # Páginas específicas
│   ├── 📁 components/
│   │   ├── 📁 admin/                # Componentes admin
│   │   ├── 📁 forms/                # Formulários integrados
│   │   └── 📁 ui/                   # Componentes de UI
│   ├── 📁 lib/
│   │   ├── 📁 firebase/             # Configuração Firebase
│   │   └── 📁 utils/                # Utilitários
│   └── 📁 contexts/                 # React Contexts
├── 📁 public/                       # Assets públicos
├── 📄 package.json                  # Dependências
├── 📄 tailwind.config.js           # Configuração Tailwind
├── 📄 next.config.js               # Configuração Next.js
└── 📄 tsconfig.json                # Configuração TypeScript
```

## 🚀 Início Rápido

### 1. Instalação

```bash
# Clonar repositório
git clone https://github.com/your-repo/prismas33-site
cd prismas33-site

# Instalar dependências
npm install
```

### 2. Configuração do Firebase

```bash
# Criar projeto no Firebase Console
# Ativar Authentication, Firestore e Storage
# Copiar configurações para .env.local
```

### 3. Environment Variables

Criar arquivo `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Executar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Abrir navegador
http://localhost:3000
```

## 🔐 Configuração de Administradores

### 1. Firebase Authentication

No Firebase Console:
- **Authentication > Users**
- **Adicionar usuários manualmente:**
  - admin@prismas33.com
  - contato@prismas33.com
  - dev@prismas33.com

### 2. Regras do Firestore

Aplicar as regras de segurança do arquivo `FIRESTORE_RULES.md`.

## 📖 Documentação

- **[🔧 Configuração de Ambiente](./ENVIRONMENT_SETUP.md)**: Guia completo de configuração
- **[🔒 Regras do Firestore](./FIRESTORE_RULES.md)**: Regras de segurança
- **[🚀 Guia de Deploy](./DEPLOYMENT_GUIDE.md)**: Instruções de deployment

## 🎯 Como Usar

### Para Administradores:

1. **Aceder à Dashboard**: `seu-site.com/admin`
2. **Fazer Login**: Com email autorizado
3. **Gerir Conteúdo**: Através das diferentes seções

### Para Visitantes:

1. **Navegar no Site**: Ver portfólio e informações
2. **Entrar em Contacto**: Através do formulário
3. **Demonstrar Interesse**: Registar interesse nas apps

## 📊 Funcionalidades Detalhadas

### 💼 Gestão de Projetos
- ➕ **Criar projetos** para o portfólio
- ✏️ **Editar informações** e categorias
- 🖼️ **Upload de imagens** (preview)
- 🗂️ **Organizar por categorias**
- 👁️ **Visualizar no site** automaticamente

### 📧 Sistema de Mensagens
- 📥 **Receber mensagens** do formulário de contacto
- 📋 **Visualizar detalhes** completos
- ✉️ **Responder via email** (integração)
- 🏷️ **Marcar status** (pendente/respondida)
- 🗂️ **Organizar por data** e prioridade

### 🔔 Gestão de Notificações
- 📝 **Registos de interesse** nas aplicações
- 📊 **Estatísticas por app**
- 📧 **Contactar interessados**
- 📈 **Acompanhar conversões**

### 👥 CRM - Clientes
- 👤 **Perfis de clientes** completos
- 📞 **Informações de contacto**
- 📝 **Histórico de interações**
- 💼 **Projetos associados**
- 🏷️ **Tags e categorização**

### 📋 Gestão de Propostas
- 📄 **Criar propostas** profissionais
- 💰 **Gerir orçamentos** e valores
- 📅 **Acompanhar prazos**
- 📊 **Status de aprovação**
- 📤 **Envio automático** por email

## 🎨 Personalização

### Cores e Branding
```css
/* src/app/globals.css */
:root {
  --primary: #3b82f6;
  --secondary: #64748b;
  --accent: #f59e0b;
}
```

### Componentes
- **Modular**: Componentes reutilizáveis
- **Responsivo**: Design mobile-first
- **Acessível**: Conformidade WCAG
- **Consistente**: Design system unificado

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Coverage de testes
npm run test:coverage
```

## 📦 Build e Deploy

```bash
# Build para produção
npm run build

# Executar build
npm start

# Deploy automático (Vercel)
git push origin main
```

## 🔧 Configuração Avançada

### Performance
- **Static Generation**: Páginas estáticas quando possível
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Análise de bundles

### SEO
- **Meta Tags**: Configuradas dinamicamente
- **Sitemap**: Gerado automaticamente
- **Structured Data**: Schema.org markup

### Security
- **Environment Variables**: Configuração segura
- **Firestore Rules**: Acesso controlado
- **HTTPS**: Certificados SSL

## 🤝 Contribuição

1. **Fork** o projeto
2. **Criar branch** para feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** as mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. **Push** para branch (`git push origin feature/nova-funcionalidade`)
5. **Abrir Pull Request**

## 📝 Licença

Este projeto é propriedade da **Prismas33** e está licenciado sob os termos da licença proprietária.

## 📞 Suporte

- **Email**: dev@prismas33.com
- **Website**: https://prismas33.com
- **Documentação**: Ver arquivos `.md` no projeto

---

## 🎉 Status do Projeto

✅ **Sistema Completo e Funcional**

- ✅ Autenticação segura
- ✅ Dashboard administrativa
- ✅ Gestão de projetos
- ✅ Sistema de mensagens
- ✅ CRM completo
- ✅ Gestão de propostas
- ✅ Integração com formulários
- ✅ Design responsivo
- ✅ Pronto para produção

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Desenvolvido para**: Prismas33 Business Management
