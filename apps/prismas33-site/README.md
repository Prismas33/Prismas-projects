# Prismas 33 - Site Oficial

Um site minimalista e high-tech para a marca Prismas 33, focado em apresentar um marketplace de aplicativos em desenvolvimento.

## 🎯 Características

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

### Executar localmente
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
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # JavaScript
└── README.md          # Este arquivo
```

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
