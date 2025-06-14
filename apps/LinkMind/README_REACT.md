# 🧠 LinkMind - React + Node.js

Uma aplicação moderna para gestão de ideias e informações pessoais, construída com React, TypeScript e Node.js, integrada com Firebase.

## 🏗️ Arquitetura

```
linkmind/
├── client/          # React + TypeScript Frontend
├── server/          # Node.js + Express API
├── .env            # Variáveis de ambiente
└── package.json    # Scripts principais
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm run install-all
```

### 2. Configurar Firebase
- Siga as instruções em `FIREBASE_SETUP.md`
- Baixe o `serviceAccountKey.json` e coloque na raiz do projeto

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

Isso irá iniciar:
- **API Server**: http://localhost:5000
- **React App**: http://localhost:3000

### 4. Executar Separadamente

**Apenas o servidor:**
```bash
npm run server
```

**Apenas o cliente:**
```bash
npm run client
```

## 📱 Funcionalidades

- ✅ **Autenticação**: Login/Registro seguro
- ✅ **Dashboard**: Visão geral das ideias
- ✅ **Gestão de Ideias**: Criar, editar, buscar
- ✅ **Configurações**: Perfil, senha, estatísticas
- ✅ **Segurança**: Exclusão de dados, validações

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **CSS Modules** para estilização
- **Firebase SDK** para autenticação
- **Fetch API** para comunicação com API

### Backend
- **Node.js** + **Express**
- **Firebase Admin SDK**
- **bcryptjs** para hash de senhas
- **express-session** para autenticação

### Database
- **Firebase Firestore** (NoSQL)

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa cliente e servidor simultaneamente
- `npm run client` - Executa apenas o React
- `npm run server` - Executa apenas a API
- `npm run build` - Build de produção do React
- `npm start` - Executa servidor em produção
- `npm run install-all` - Instala dependências de ambos os projetos

## 🌟 Próximos Passos

1. ✅ Migração para React + TypeScript - **CONCLUÍDO**
2. 🔄 Criação dos componentes React
3. 🔄 Implementação do roteamento
4. 🔄 Integração com Firebase no frontend
5. 🔄 Testes unitários
6. 🔄 Deploy em produção

## 📋 Estrutura da API

- `GET /api/firebase-config` - Configurações Firebase
- `POST /api/register` - Registro de usuário
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/user` - Dados do usuário
- `GET /api/ideas` - Listar ideias
- `POST /api/ideas` - Criar ideia
- `GET /api/user/profile` - Perfil do usuário
- `PUT /api/user/profile` - Atualizar perfil
- `PUT /api/user/change-password` - Alterar senha
- `GET /api/user/stats` - Estatísticas
- `DELETE /api/user/delete-all-ideas` - Excluir todas ideias
- `DELETE /api/user/delete-account` - Excluir conta

---

🚀 **Projeto migrado com sucesso para React + Node.js!**
