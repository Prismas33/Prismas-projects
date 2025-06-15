import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./config";

const storage = getStorage(app);

export async function uploadArquivo(userId, file) {
  try {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const fileRef = ref(storage, `uploads/${userId}/${fileName}`);
    
    console.log('Iniciando upload para:', fileRef.fullPath);
    
    // Usar metadata para melhor compatibilidade
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name
      }
    };
    
    const uploadResult = await uploadBytes(fileRef, file, metadata);
    console.log('Upload concluído, obtendo URL...');
    
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('URL obtida:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Erro detalhado no upload:', error);
    console.error('Código do erro:', error.code);
    console.error('Mensagem do erro:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error('Você não tem permissão para fazer upload. Verifique as regras do Firebase Storage.');
    } else if (error.code === 'storage/cors-policy-violation') {
      throw new Error('Erro de CORS. Configure o CORS no Firebase Storage para permitir localhost:3000');
    } else if (error.message.includes('CORS')) {
      throw new Error('Erro de CORS. Execute o script configure-cors.ps1 para corrigir.');
    } else {
      throw new Error(`Erro no upload: ${error.message}`);
    }
  }
}
