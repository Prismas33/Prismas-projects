// Funções para integração com formulários do site
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

// Função para salvar mensagem de contato (nome atualizado para compatibilidade)
export async function createMessageFromForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userAgent?: string;
  language?: string;
  referrer?: string;
}) {
  try {
    const messageData = {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "messages"), messageData);
    return docRef.id;
  } catch (error: any) {
    throw new Error("Erro ao salvar mensagem: " + error.message);
  }
}

// Função para salvar mensagem de contato (mantido para compatibilidade)
export async function saveContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userAgent?: string;
  language?: string;
  referrer?: string;
}) {
  return createMessageFromForm(data);
}

// Função para salvar notificação de interesse
export async function saveNotification(data: {
  email: string;
  appName: string;
  userAgent?: string;
  language?: string;
  referrer?: string;
}) {
  try {
    const notificationData = {
      ...data,
      timestamp: serverTimestamp(),
      status: 'pending'
    };

    const docRef = await addDoc(collection(db, "notifications"), notificationData);
    return docRef.id;
  } catch (error: any) {
    throw new Error("Erro ao salvar notificação: " + error.message);
  }
}
