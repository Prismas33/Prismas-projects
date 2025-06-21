// Função de teste para EmailJS - use no console do browser para testar
import { enviarEmailBoasVindasEmailJS } from './lib/email/emailServiceEmailJS.js';

export async function testarEmailJS() {
  console.log('🧪 Testando EmailJS...');
  
  // Dados de teste
  const subscriptionDataTeste = {
    id: 'TEST_SUBSCRIPTION_123',
    plan_id: process.env.PAYPAL_MONTHLY_PLAN_ID || 'P-2S058014PP6652810NBLHD2A'
  };
  
  const userDataTeste = {
    nome: 'Teste Usuario',
    displayName: 'Teste Usuario',
    email: 'geral.prismas@gmail.com' // Seu próprio email para teste
  };
  
  try {
    const resultado = await enviarEmailBoasVindasEmailJS(subscriptionDataTeste, userDataTeste);
    
    if (resultado.success) {
      console.log('✅ Teste EmailJS PASSOU!');
      console.log('📧 Email enviado com sucesso');
      console.log('🔍 Verifique sua caixa de entrada:', userDataTeste.email);
    } else {
      console.log('❌ Teste EmailJS FALHOU!');
      console.error('Erro:', resultado.error);
    }
    
    return resultado;
    
  } catch (error) {
    console.log('❌ Erro no teste EmailJS:', error);
    return { success: false, error };
  }
}

// Para usar no console do browser:
// testarEmailJS().then(resultado => console.log('Resultado:', resultado));
