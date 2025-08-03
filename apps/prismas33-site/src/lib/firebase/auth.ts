// Funções de autenticação para o sistema admin
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Lista de emails autorizados para acesso admin
const ADMIN_EMAILS = [
  "geral.prismas@gmail.com",
  "contato@prismas33.com",
  "dev@prismas33.com"
];

export async function signInAdmin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Verificar se o email está na lista de admins
    if (!ADMIN_EMAILS.includes(email)) {
      await signOut(auth);
      throw new Error("Acesso não autorizado");
    }
    
    return userCredential;
  } catch (error: any) {
    throw new Error("Erro ao fazer login: " + error.message);
  }
}

export async function signOutAdmin() {
  try {
    return await signOut(auth);
  } catch (error: any) {
    throw new Error("Erro ao sair: " + error.message);
  }
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

export function onAdminAuthStateChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (user && isAdminEmail(user.email || "")) {
      callback(user);
    } else {
      callback(null);
    }
  });
}
