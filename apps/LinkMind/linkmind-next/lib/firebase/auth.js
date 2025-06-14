import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./config";
import bcrypt from "bcryptjs";

export async function registarUtilizador(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  // Aqui você deve salvar o hashedPassword no Firestore junto com o email
  return createUserWithEmailAndPassword(auth, email, hashedPassword);
}

export async function loginUtilizador(email, password) {
  // Buscar user no Firestore e obter hashedPassword
  const userSnapshot = await /* ... buscar user no Firestore ... */ null;
  const isValid = await bcrypt.compare(password, userSnapshot?.hashedPassword || "");
  if (!isValid) throw new Error("Password incorreta");
  return signInWithEmailAndPassword(auth, email, password);
}
