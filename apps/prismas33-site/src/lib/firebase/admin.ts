// Firebase Admin SDK para uso nas rotas API (server-side)
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configuração segura do Firebase Admin SDK
function createFirebaseAdminApp() {
  // Verificar se já existe uma instância inicializada
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Validar variáveis de ambiente obrigatórias
  const requiredEnvVars = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  // Verificar se todas as variáveis estão definidas
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Firebase Admin SDK: Variáveis de ambiente em falta: ${missingVars.join(', ')}. ` +
      'Certifique-se de que FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY e FIREBASE_CLIENT_EMAIL estão definidas.'
    );
  }

  try {
    // Construir o objeto de credenciais do service account
    const serviceAccount: ServiceAccount = {
      projectId: requiredEnvVars.projectId!,
      privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
      clientEmail: requiredEnvVars.clientEmail!,
    };

    // Inicializar o Firebase Admin com as credenciais do service account
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: requiredEnvVars.projectId,
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin SDK:', error);
    throw new Error(`Firebase Admin SDK: Falha na inicialização - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Função para verificar se o Firebase Admin está configurado corretamente
export function isFirebaseAdminConfigured(): boolean {
  try {
    const requiredVars = [
      process.env.FIREBASE_PROJECT_ID,
      process.env.FIREBASE_PRIVATE_KEY,
      process.env.FIREBASE_CLIENT_EMAIL
    ];
    return requiredVars.every(v => v && v.length > 0);
  } catch {
    return false;
  }
}

// Exportar instâncias com verificação de configuração
let adminApp: any = null;
let adminDb: any = null;

try {
  if (isFirebaseAdminConfigured()) {
    adminApp = createFirebaseAdminApp();
    adminDb = getFirestore(adminApp);
    console.log('✅ Firebase Admin SDK inicializado com sucesso');
  } else {
    console.warn('⚠️ Firebase Admin SDK não configurado - verifique as variáveis de ambiente');
  }
} catch (error) {
  console.error('❌ Erro na configuração do Firebase Admin SDK:', error);
}

export { adminApp, adminDb };
