import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

export async function registarUtilizador(email, password, nome) {
  try {
    // Criar usuário com Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualizar perfil com nome
    await updateProfile(user, {
      displayName: nome
    });
    
    // Salvar dados adicionais no Firestore
    await setDoc(doc(db, "utilizadores", user.uid), {
      nome: nome,
      email: email,
      criadoEm: new Date(),
      ideias: []
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

export async function obterDadosUtilizador(uid) {
  try {
    const docRef = doc(db, "utilizadores", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    throw new Error("Erro ao obter dados: " + error.message);
  }
}
