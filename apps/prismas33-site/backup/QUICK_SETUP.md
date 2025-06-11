# 🔥 GUIA RÁPIDO: Habilitar Firebase Storage

## ✅ **CHECKLIST - Siga esta ordem:**

### [ ] 1. Habilitar Storage
1. Abra: https://console.firebase.google.com/project/prismas33-1914c/storage
2. Clique em **"Get started"**
3. Aceite as regras padrão
4. Escolha localização: **southamerica-east1** (São Paulo)
5. Clique em **"Done"**

### [ ] 2. Configurar Regras
1. Vá para aba **"Rules"**
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
    }
    match /apks/{allPaths=**} {
      allow write: if request.resource.size < 100 * 1024 * 1024
                   && request.resource.contentType.matches('application/.*');
    }
  }
}
```

3. Clique em **"Publish"**

### [ ] 3. Aguardar
- Aguarde **5 minutos** para as regras propagarem

### [ ] 4. Testar
1. Abra `safecallkids.html`
2. Status indicator deve mostrar: 🟢 "Firebase conectado"
3. Clique em "Google Play" → Upload modal
4. Teste upload de arquivo APK

---

## 🎯 **Resultado Esperado:**

Após configurar tudo:
- ✅ Storage habilitado
- ✅ Regras configuradas  
- ✅ Upload funcionando
- ✅ Download direto disponível

---

## 📞 **Se precisar de ajuda:**

Copie qualquer erro do console (F12) e me envie!

**Link direto para seu projeto:**
https://console.firebase.google.com/project/prismas33-1914c/storage
