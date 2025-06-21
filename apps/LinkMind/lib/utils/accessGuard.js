import { useState } from "react";
import { verificarAcessoPremium } from "../firebase/auth";
import { nomeParaIdFirestore } from "../firebase/utils";

export async function checkPremiumAccess(user) {
  if (!user?.displayName) {
    return { hasAccess: false, type: 'no_user' };
  }

  try {
    const nomeId = nomeParaIdFirestore(user.displayName);
    const status = await verificarAcessoPremium(nomeId);
    
    // Usuário tem acesso se:
    // - Tem premium pago ativo
    // - Tem premium gratuito (código especial)
    // - Está em trial válido
    const hasAccess = status.type === 'premium' || 
                     status.type === 'premium_free' || 
                     status.type === 'trial';

    return {
      hasAccess,
      type: status.type,
      daysRemaining: status.daysRemaining,
      message: getAccessMessage(status.type, status.daysRemaining)
    };
  } catch (error) {
    console.error("Erro ao verificar acesso premium:", error);
    return { hasAccess: false, type: 'error' };
  }
}

function getAccessMessage(type, daysRemaining) {
  switch (type) {
    case 'premium':
      return 'Você tem acesso premium ativo!';
    case 'premium_free':
      return 'Você tem acesso premium especial!';
    case 'trial':
      return `Você está no período de trial (${daysRemaining} dias restantes).`;
    case 'expired':
      return 'Seu trial expirou. Assine um plano para continuar.';
    default:
      return 'Status de acesso desconhecido.';
  }
}

export function useAccessGuard() {
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  return { accessStatus, loading, checkAccess: checkPremiumAccess };
}
