# Prismas 33 - Site Oficial e SafeCallKids

Este repositório contém dois projetos principais:

## 1. 🏢 Site Oficial Prismas 33
Um site minimalista e high-tech para a marca Prismas 33, focado em apresentar um marketplace de aplicativos em desenvolvimento.

## 2. 📱 SafeCallKids Landing Page
Uma landing page profissional para o aplicativo SafeCallKids, que protege crianças bloqueando chamadas de números desconhecidos.

---

## 🎯 SafeCallKids - Características

### Design
- **Profissional e moderno**: Interface limpa focada na proteção infantil
- **Cores**: Azul (#3498DB) transmitindo confiança e segurança
- **Responsivo**: Adaptável para todos os dispositivos
- **Multilíngue**: Suporte para Português e Inglês

### Funcionalidades
- **Duas versões disponíveis**:
  - **Versão Completa** (`safecallkids.html`): Com upload de APK via Firebase
  - **Versão Limpa** (`safecallkids-clean.html`): Download direto sem Firebase
- **Hero Section**: Apresentação do app com botões de download
- **Seção de Funcionalidades**: 6 principais recursos do app  
- **Como Funciona**: 3 passos simples de uso
- **Estatísticas**: Números de segurança e proteção
- **Seção de Download**: Botões para Google Play e APK direto

### Recursos Técnicos
- **Firebase Integration**: Upload e storage de arquivos APK (versão completa)
- **Direct Download**: Link direto para APK hospedada (versão limpa)
- **Language Detection**: Detecção automática do idioma do navegador
- **Smooth Animations**: Transições e efeitos visuais profissionais
- **SEO Optimized**: Meta tags e estrutura semântica adequada

---

## 🏢 Prismas 33 Site - Características

### Design
- **Minimalista e High-tech**: Design limpo com foco na experiência do usuário
- **Cores da marca**: Laranja (#FF6B35) e Preto (#000000)
- **Logo animado**: Prisma geométrico 3D com animação de rotação e brilho
- **Tipografia**: Montserrat para títulos, Inter para texto

### Funcionalidades
- **Hero Section**: Logo animado com call-to-action para explorar apps
- **Marketplace**: Cards dos 4 aplicativos com sistema de notificações
- **Modal de notificação**: Captura de emails para avisar sobre lançamentos
- **Animações suaves**: Scroll suave, hover effects, e transições
- **Responsivo**: Mobile-first, adaptável a todos os dispositivos

### Aplicativos Apresentados
1. **Nexus 5**: Conversor Node.js → Android/EXE
2. **Cerebra 7**: Organizador de informação com IA
3. **Puzzle 33**: Jogos educativos para crianças
4. **DocFlow 4**: Conversor PDF → Word

## 🚀 Como usar

### SafeCallKids - Versão Limpa (Recomendada)
1. Abra o arquivo `safecallkids-clean.html` no navegador
2. Ambos os botões fazem download direto da APK
3. Não requer configuração do Firebase
4. Pronto para uso em produção!

### SafeCallKids - Versão Completa (Para desenvolvimento)
1. Configure o Firebase seguindo `FIREBASE_SETUP.md`
2. Abra o arquivo `safecallkids.html` no navegador
3. Use o botão Google Play para upload de APKs
4. Consulte `TROUBLESHOOTING.md` se houver problemas

### Prismas 33 Site - Executar localmente
1. Clone ou baixe os arquivos do projeto
2. Abra o arquivo `index.html` em um navegador moderno
3. Ou use um servidor local:
   ```bash
   # Com Python
   python -m http.server 8000
   
   # Com Node.js (http-server)
   npx http-server
   
   # Com PHP
   php -S localhost:8000
   ```

### Estrutura de arquivos
```
prismas33-site/
├── index.html                 # Prismas 33 - Página principal
├── styles.css                 # Estilos do Prismas 33
├── script.js                  # JavaScript do Prismas 33
├── safecallkids.html          # SafeCallKids - Versão completa (com Firebase)
├── safecallkids-clean.html    # SafeCallKids - Versão limpa (download direto)
├── safecallkids.css           # Estilos do SafeCallKids
├── safecallkids-v9.js         # JavaScript completo (Firebase v9+)
├── safecallkids-clean.js      # JavaScript limpo (sem Firebase)
├── FIREBASE_SETUP.md          # Guia de configuração do Firebase
├── TROUBLESHOOTING.md         # Guia de solução de problemas
├── VERSIONS.md                # Documentação das versões
├── assets/logos/              # Logos e imagens
└── README.md                  # Este arquivo
```

## 📋 Documentação Adicional

- **`FIREBASE_SETUP.md`**: Como configurar o Firebase Storage
- **`TROUBLESHOOTING.md`**: Solução de problemas comuns  
- **`VERSIONS.md`**: Diferenças entre as versões do SafeCallKids
- **`QUICK_SETUP.md`**: Guia rápido de configuração

## 🔗 Links Úteis

### SafeCallKids APK Download Direto:
```
https://firebasestorage.googleapis.com/v0/b/prismas33-1914c.firebasestorage.app/o/apks%2Fsafecallkids_1749638790127.apk?alt=media&token=68ef2062-c4ea-4450-939b-be8605fbffab
```

### Firebase Project:
- **Project ID**: `prismas33-1914c`
- **Storage Bucket**: `prismas33-1914c.firebasestorage.app`

## 🎨 Paleta de Cores

- **Laranja primário**: `#FF6B35`
- **Preto primário**: `#000000`
- **Fundo escuro**: `#0a0a0a`
- **Fundo secundário**: `#1a1a1a`
- **Texto claro**: `#ffffff`
- **Texto cinza**: `#cccccc`

## ⚡ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: 
  - CSS Grid e Flexbox
  - Animações CSS
  - Gradientes e sombras
  - Media queries (responsivo)
- **JavaScript ES6+**:
  - DOM manipulation
  - Local Storage
  - Intersection Observer API
  - Event handling
- **Google Fonts**: Montserrat e Inter
- **Font Awesome**: Ícones

## 📱 Responsividade

O site é totalmente responsivo com breakpoints:
- **Mobile**: até 480px
- **Tablet**: 481px - 768px  
- **Desktop**: 769px+

## 🔧 Funcionalidades Técnicas

### Sistema de Notificações
- Captura de emails por aplicativo
- Validação de email
- Armazenamento local (LocalStorage)
- Feedback visual de sucesso/erro

### Animações
- Logo com rotação 3D e efeito de brilho
- Cards com hover effect e escala
- Scroll suave entre seções
- Animações de entrada com delay
- Parallax no hero background

### Performance
- Throttling nos eventos de scroll
- Lazy loading de animações
- Otimização para dispositivos móveis

## 🎪 Interações

### Logo Prisma
- Rotação 3D contínua
- Efeito de brilho periódico
- Gradiente laranja

### Cards dos Apps
- Hover: escala 105% + brilho laranja
- Animação de entrada escalonada
- Efeito de luz passando

### Modal de Notificação
- Abertura suave com slide
- Fechamento com ESC ou clique fora
- Loading state no botão de envio
- Mensagem de sucesso automática

## 🔮 Melhorias Futuras

- [ ] Integração com backend para emails
- [ ] Analytics e tracking
- [ ] PWA (Progressive Web App)
- [ ] Otimização SEO
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## 📄 Licença

Este projeto é parte do portfólio da Prismas 33.

---

**Prismas 33** - Transformando ideias em código
