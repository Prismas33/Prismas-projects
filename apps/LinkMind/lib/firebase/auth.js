import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  updatePassword,
  deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { nomeParaIdFirestore } from "./utils";

export async function registarUtilizador(email, password, nome) {
  try {
    // Criar usuário com Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualizar perfil com nome
    await updateProfile(user, {
      displayName: nome
    });
    
    // Salvar dados adicionais no Firestore, usando o nome como ID do documento
    const nomeId = nomeParaIdFirestore(nome);    await setDoc(doc(db, "users", nomeId), {
      nome: nome,
      email: email,
      criadoEm: new Date(),
      arquivos: []
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
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    throw new Error("Erro ao obter dados: " + error.message);
  }
}

export async function trocarSenha(novaSenha) {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    await updatePassword(auth.currentUser, novaSenha);
    return true;
  } catch (error) {
    throw new Error("Erro ao trocar senha: " + error.message);
  }
}

export async function excluirConta() {
  try {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    
    // Primeiro, obter o nome do usuário para deletar o documento no Firestore
    const displayName = auth.currentUser.displayName;
    if (displayName) {
      const nomeId = nomeParaIdFirestore(displayName);
      // Deletar documento do usuário no Firestore
      await deleteDoc(doc(db, "users", nomeId));
    }
    
    // Depois deletar a conta do Firebase Auth
    await deleteUser(auth.currentUser);
    return true;
  } catch (error) {
    throw new Error("Erro ao excluir conta: " + error.message);
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
