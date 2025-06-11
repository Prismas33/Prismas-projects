# SafeCallKids - Versões dos Arquivos

## 📁 Estrutura dos Arquivos

### Versão Original (Com Firebase Upload)
- **HTML:** `safecallkids.html`
- **JavaScript:** `safecallkids-v9.js`
- **Funcionalidades:**
  - ✅ Indicador de status do Firebase
  - ✅ Modal de upload de APK
  - ✅ Integração completa com Firebase Storage
  - ✅ Upload de arquivos APK
  - ✅ Geração de URLs de download
  - ✅ Suporte multilíngue (PT/EN)

### Versão Limpa (Download Direto)
- **HTML:** `safecallkids-clean.html`
- **JavaScript:** `safecallkids-clean.js`
- **Funcionalidades:**
  - ❌ Sem indicador de status do Firebase
  - ❌ Sem modal de upload
  - ❌ Sem scripts do Firebase
  - ✅ Download direto da APK (ambos os botões)
  - ✅ Suporte multilíngue (PT/EN)
  - ✅ Interface limpa e simplificada

## 🚀 Como Usar

### Para a Versão Limpa (Recomendada para produção):
1. Abra o arquivo `safecallkids-clean.html`
2. Ambos os botões (Google Play e APK Direto) fazem download direto da APK
3. Não requer configuração do Firebase
4. Pronto para uso!

### Para a Versão Original (Para desenvolvimento):
1. Abra o arquivo `safecallkids.html`
2. Configure o Firebase conforme `FIREBASE_SETUP.md`
3. Use o botão Google Play para fazer upload de novas APKs
4. Use o botão APK Direto para download direto

## 📱 APK Atual Disponível

**URL de Download Direto:**
```
https://firebasestorage.googleapis.com/v0/b/prismas33-1914c.firebasestorage.app/o/apks%2Fsafecallkids_1749638790127.apk?alt=media&token=68ef2062-c4ea-4450-939b-be8605fbffab
```

## 🔧 Personalização

### Para Atualizar a URL da APK na Versão Limpa:
1. Abra o arquivo `safecallkids-clean.js`
2. Localize a linha:
   ```javascript
   this.currentApkUrl = 'https://firebasestorage.googleapis.com/...';
   ```
3. Substitua pela nova URL da APK
4. Salve o arquivo

### Para Alterar Textos ou Traduções:
- Edite os atributos `data-pt` e `data-en` nos elementos HTML
- Para novos idiomas, edite os objetos de tradução no arquivo JavaScript

## 📋 Funcionalidades Comuns (Ambas as Versões)

✅ **Design Responsivo:** Funciona em desktop, tablet e mobile  
✅ **Multilíngue:** Português e Inglês com detecção automática  
✅ **Animações:** Efeitos visuais suaves e profissionais  
✅ **SEO Otimizado:** Meta tags e estrutura semântica  
✅ **Performance:** Carregamento rápido e otimizado  
✅ **Acessibilidade:** Suporte a leitores de tela e navegação por teclado  

## 🎯 Recomendação

**Use `safecallkids-clean.html` para:**
- Sites em produção
- Quando você já tem a APK hospedada
- Maior simplicidade e performance
- Menos dependências externas

**Use `safecallkids.html` para:**
- Desenvolvimento e testes
- Quando precisa fazer upload de novas versões
- Gerenciamento dinâmico de arquivos APK
