# Firebase Storage Security Rules

Para resolver os problemas de CORS e permitir uploads, você precisa configurar as regras de segurança do Firebase Storage.

## Como configurar:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `prismas33-1914c`
3. Vá para "Storage" no menu lateral
4. Clique na aba "Rules"
5. Substitua as regras existentes pelas regras abaixo:

## Regras de Segurança do Storage (Sem Autenticação):

Para resolver os problemas de autenticação, use estas regras que não requerem login:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access to APK files without authentication
    match /apks/{fileName} {
      allow write: if fileName.matches('.*\\.apk$')
                   && resource == null
                   && request.resource.size <= 100 * 1024 * 1024; // 100MB limit
    }
  }
}
```

## Regras de Segurança do Storage (Com Autenticação - Alternativa):

Se quiser manter autenticação, use estas regras e habilite autenticação anônima:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access to APK files for authenticated users (anonymous ok)
    match /apks/{fileName} {
      allow write: if request.auth != null 
                   && fileName.matches('.*\\.apk$')
                   && resource == null
                   && request.resource.size <= 100 * 1024 * 1024; // 100MB limit
    }
  }
}
```

## Para Habilitar Autenticação Anônima (se usar a segunda opção):

1. Vá para o Firebase Console → Authentication
2. Clique na aba "Sign-in method"
3. Encontre "Anonymous" na lista
4. Clique para habilitar
5. Salve as configurações

## Regras Alternativas (Mais Permissivas para Desenvolvimento):

Se ainda tiver problemas, use estas regras temporariamente:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ATENÇÃO**: As regras alternativas são apenas para desenvolvimento. Use as regras principais em produção.

## Configuração de CORS (Opcional):

Se ainda tiver problemas de CORS, você pode configurar CORS no bucket do Storage:

1. Instale o Google Cloud SDK
2. Execute o comando:

```bash
gsutil cors set cors.json gs://prismas33-1914c.firebasestorage.app
```

Onde `cors.json` contém:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

## Passos para testar:

1. Configure as regras no Firebase Console
2. Aguarde alguns minutos para as regras serem aplicadas
3. Recarregue a página do SafeCallKids
4. Tente fazer upload de um arquivo APK

## Notas importantes:

- O arquivo deve ter extensão `.apk`
- Tamanho máximo: 100MB
- O Firebase pode levar alguns minutos para aplicar as novas regras
- Certifique-se de que a autenticação anônima está habilitada no projeto
