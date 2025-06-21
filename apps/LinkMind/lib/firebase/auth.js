import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { nomeParaIdFirestore } from "./utils";

export async function registarUtilizador(email, password, nome, codigoAcesso = null) {
  try {
    // Criar usuário com Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualizar perfil com nome
    await updateProfile(user, {
      displayName: nome
    });
    
    // Configurar dados do usuário baseado no código de acesso
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
      let subscriptionStatus = 'trial';
    let hasSecretCode = false;
    
    // Verificar código de acesso (senha especial)
    if (codigoAcesso === process.env.NEXT_PUBLIC_SECRET_ACCESS_CODE) {
      subscriptionStatus = 'premium_free';
      hasSecretCode = true;
    }
    
    // Salvar dados adicionais no Firestore, usando o nome como ID do documento
    const nomeId = nomeParaIdFirestore(nome);
    await setDoc(doc(db, "users", nomeId), {
      nome: nome,
      email: email,
      criadoEm: now,
      arquivos: [],
      // Dados de assinatura
      subscriptionStatus: subscriptionStatus,
      hasSecretCode: hasSecretCode,
      trialStartDate: now,
      trialEndDate: hasSecretCode ? null : trialEnd,
      subscriptionID: null,
      planType: null,
      paypalSubscriptionActive: false
    });
    
    return userCredential;
  } catch (error) {
    throw new Error("Erro ao registar: " + error.message);
  }
}

export async function loginUtilizador(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error("Erro ao entrar: " + error.message);
  }
}

export async function logoutUtilizador() {
  try {
    return await signOut(auth);
  } catch (error) {
    throw new Error("Erro ao sair: " + error.message);
  }
}

export async function obterDadosUtilizador(nomeId) {
  try {
    const docRef = doc(db, "users", nomeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;  } catch (error) {
    throw new Error("Erro ao obter dados: " + error.message);
  }
}

export async function trocarSenha(novaSenha, senhaAtual = null) {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    
    // Se for usuário com email/senha, precisa reautenticar com a senha atual
    if (auth.currentUser.providerData?.[0]?.providerId !== 'google.com' && senhaAtual) {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, senhaAtual);
      await reauthenticateWithCredential(auth.currentUser, credential);
    }
    
    await updatePassword(auth.currentUser, novaSenha);
    return true;
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Sessão expirada. Faça login novamente para trocar a senha.");
    } else if (error.code === 'auth/wrong-password') {
      throw new Error("Senha atual incorreta. Tente novamente.");
    } else {
      throw new Error("Erro ao trocar senha: " + error.message);
    }
  }
}

export async function excluirConta() {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    
    // Primeiro, obter o nome do usuário para deletar o documento no Firestore
    const displayName = auth.currentUser.displayName;
    if (displayName) {
      const nomeId = nomeParaIdFirestore(displayName);
      
      // Antes de deletar, você poderia implementar aqui a lógica para exportar os dados
      // Por exemplo, gerar um PDF com os dados do usuário
      
      // Deletar documento do usuário no Firestore
      await deleteDoc(doc(db, "users", nomeId));
    }
    
    // Depois deletar a conta do Firebase Auth
    await deleteUser(auth.currentUser);
    return true;
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Para excluir sua conta, faça login novamente.");
    } else {
      throw new Error("Erro ao excluir conta: " + error.message);
    }
  }
}

export async function atualizarFotoPerfil(nomeId, fotoUrl) {
  try {
    const userRef = doc(db, "users", nomeId);
    await updateDoc(userRef, {
      fotoPerfil: fotoUrl
    });
    return true;
  } catch (error) {
    throw new Error("Erro ao atualizar foto de perfil: " + error.message);
  }
}

export async function atualizarIdiomaUsuario(nomeId, idioma) {
  try {
    const userRef = doc(db, "users", nomeId);
    await updateDoc(userRef, { idioma });
    return true;
  } catch (error) {
    throw new Error("Erro ao atualizar idioma: " + error.message);
  }
}

// Função para verificar se o usuário tem acesso premium
export async function verificarAcessoPremium(nomeId) {
  try {
    const userDoc = await getDoc(doc(db, "users", nomeId));
    
    if (!userDoc.exists()) {
      return { hasAccess: false, reason: 'user_not_found' };
    }
    
    const userData = userDoc.data();
    const now = new Date();
    
    // Se tem código secreto, acesso permanente
    if (userData.hasSecretCode) {
      return { hasAccess: true, reason: 'secret_code', userData };
    }
    
    // Se tem assinatura ativa do PayPal
    if (userData.paypalSubscriptionActive && userData.subscriptionID) {
      return { hasAccess: true, reason: 'active_subscription', userData };
    }
    
    // Verificar se ainda está no período de trial
    if (userData.subscriptionStatus === 'trial' && userData.trialEndDate) {
      const trialEnd = new Date(userData.trialEndDate);
      if (now < trialEnd) {
        return { hasAccess: true, reason: 'trial_active', userData, trialEnd };
      } else {
        return { hasAccess: false, reason: 'trial_expired', userData };
      }
    }
    
    return { hasAccess: false, reason: 'no_active_subscription', userData };
  } catch (error) {
    console.error("Erro ao verificar acesso premium:", error);
    return { hasAccess: false, reason: 'error' };
  }
}

// Função para atualizar status da assinatura após pagamento PayPal
export async function atualizarAssinatura(nomeId, subscriptionID, planType) {
  try {
    await updateDoc(doc(db, "users", nomeId), {
      subscriptionStatus: 'active',
      subscriptionID: subscriptionID,
      planType: planType,
      paypalSubscriptionActive: true,
      subscriptionActivatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar assinatura:", error);
    return false;
  }
}

// Função para aplicar código secreto e obter acesso premium gratuito
export async function aplicarCodigoSecreto(nomeId, codigo) {
  try {
    // Verificar se o código está correcto
    const secretCode = process.env.NEXT_PUBLIC_SECRET_ACCESS_CODE;
    if (!secretCode || codigo !== secretCode) {
      return { success: false, message: "Código inválido." };
    }
    
    // Verificar se o utilizador existe
    const docRef = doc(db, "users", nomeId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, message: "Utilizador não encontrado." };
    }
    
    const userData = docSnap.data();
    
    // Verificar se já tem acesso premium
    if (userData.hasSecretCode) {
      return { success: false, message: "Já possui acesso premium gratuito." };
    }
    
    // Aplicar código secreto
    await updateDoc(docRef, {
      subscriptionStatus: 'premium_free',
      hasSecretCode: true,
      trialEndDate: null, // Remover data de fim do trial
      secretCodeAppliedAt: new Date()
    });
    
    return { success: true, message: "Código aplicado com sucesso! Agora tem acesso premium gratuito." };
  } catch (error) {
    console.error("Erro ao aplicar código secreto:", error);
    return { success: false, message: "Erro interno. Tente novamente." };
  }
}
