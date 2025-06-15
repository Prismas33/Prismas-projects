import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./config";

const storage = getStorage(app);

export async function uploadArquivo(userId, file) {
  try {
    const ext = file.name.split('.').pop();
    const fileRef = ref(storage, `uploads/${userId}/${Date.now()}-${file.name}`);
    
    console.log('Iniciando upload para:', fileRef.fullPath);
    await uploadBytes(fileRef, file);
    console.log('Upload concluído, obtendo URL...');
    
    const downloadURL = await getDownloadURL(fileRef);
    console.log('URL obtida:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Erro no upload:', error);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error('Você não tem permissão para fazer upload. Verifique as regras do Firebase Storage.');
    } else if (error.code === 'storage/cors-policy-violation') {
      throw new Error('Erro de CORS. Configure o CORS no Firebase Storage para permitir localhost:3001');
    } else if (error.message.includes('CORS')) {
      throw new Error('Erro de CORS. Execute o script configure-cors.ps1 para corrigir.');
    } else {
      throw new Error(`Erro no upload: ${error.message}`);
    }
  }
}
