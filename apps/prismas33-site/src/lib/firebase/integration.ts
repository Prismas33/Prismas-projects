// Funções para integração com formulários do site
import { addDoc, collection, serverTimestamp, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./config";

// Importar interfaces do firestore para evitar duplicação
import type { ProjectMessage } from "./firestore";
import type { Client } from "../api/admin";

// Interface para Notificação Admin
export interface AdminNotification {
  id?: string;
  type: 'new_project_message' | 'new_contact' | 'new_notification';
  title: string;
  message: string;
  clientId?: string;
  messageId?: string;
  read: boolean;
  createdAt: any;
}

// Função para verificar se cliente já existe
async function findExistingClient(name: string, email: string): Promise<Client | null> {
  try {
    const q = query(
      collection(db, "clients"),
      where("email", "==", email.toLowerCase())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const clientDoc = querySnapshot.docs[0];
      return {
        id: clientDoc.id,
        ...clientDoc.data()
      } as Client;
    }

    // Se não encontrou por email, verifica por nome (para casos de emails diferentes)
    const nameQuery = query(
      collection(db, "clients"),
      where("name", "==", name.trim())
    );
    
    const nameSnapshot = await getDocs(nameQuery);
    
    if (!nameSnapshot.empty) {
      const clientDoc = nameSnapshot.docs[0];
      return {
        id: clientDoc.id,
        ...clientDoc.data()
      } as Client;
    }

    return null;
  } catch (error: any) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
}

// Função para criar ou atualizar cliente
async function createOrUpdateClient(clientData: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}): Promise<string> {
  try {
    const existingClient = await findExistingClient(clientData.name, clientData.email);
    
    if (existingClient) {
      // Cliente existe, atualiza dados
      const clientRef = doc(db, "clients", existingClient.id!);
      const batch = writeBatch(db);
      
      batch.update(clientRef, {
        name: clientData.name, // Atualiza nome caso tenha mudado
        phone: clientData.phone || existingClient.phone,
        company: clientData.company || existingClient.company,
        lastContact: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
      return existingClient.id!;
    } else {
      // Cliente novo, cria
      const newClientData = {
        name: clientData.name,
        email: clientData.email.toLowerCase(),
        phone: clientData.phone || '',
        company: clientData.company || '',
        status: 'lead' as const,
        source: 'website' as const,
        notes: '',
        lastContact: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        proposalsSent: 0,
        projectsCompleted: 0,
        totalValue: 0
      };
      
      const docRef = await addDoc(collection(db, "clients"), newClientData);
      return docRef.id;
    }
  } catch (error: any) {
    throw new Error("Erro ao criar/atualizar cliente: " + error.message);
  }
}

// Função principal para salvar mensagem de projeto
export async function createProjectMessage(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  isNewProject: boolean;
  message: string;
}): Promise<{messageId: string, clientId: string, isNewClient: boolean}> {
  try {
    // Verifica se é cliente existente
    const existingClient = await findExistingClient(data.name, data.email);
    const isNewClient = !existingClient;
    
    // Cria ou atualiza cliente
    const clientId = await createOrUpdateClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company
    });

    // Determinar o tipo de mensagem e categoria
    let messageType: 'novo-projeto' | 'projeto-existente' | 'orcamento' | 'suporte' | 'outro';
    let category: 'sales' | 'support' | 'technical' | 'billing';
    let subject: string;
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    let tags: string[] = [];

    if (data.isNewProject || data.projectType === 'novo-projeto') {
      messageType = 'novo-projeto';
      category = 'sales';
      subject = `Novo Projeto: ${data.name}`;
      priority = 'high';
      tags = ['novo-projeto', 'vendas'];
    } else {
      messageType = 'projeto-existente';
      category = 'sales';
      subject = `Interesse em: ${data.projectType}`;
      tags = ['projeto-existente', data.projectType.toLowerCase()];
    }

    // Adicionar tags baseadas no conteúdo
    if (data.message.toLowerCase().includes('orçamento') || data.message.toLowerCase().includes('preço') || data.message.toLowerCase().includes('custo')) {
      messageType = 'orcamento';
      tags.push('orcamento');
      priority = 'high';
    }
    
    if (data.message.toLowerCase().includes('urgente') || data.message.toLowerCase().includes('rápido')) {
      priority = 'urgent';
      tags.push('urgente');
    }

    // Cria a mensagem organizada
    const messageData = {
      // Dados do Cliente
      clientId,
      clientName: data.name,
      clientEmail: data.email.toLowerCase(),
      clientPhone: data.phone || '',
      clientCompany: data.company || '',
      
      // Tipo de Mensagem
      messageType,
      projectReference: data.isNewProject ? '' : data.projectType,
      
      // Conteúdo
      subject,
      message: data.message,
      
      // Status e Organização
      status: 'pending' as const,
      priority,
      category,
      
      // Tags
      tags,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Metadados
      source: 'website-form' as const
    };

    const messageRef = await addDoc(collection(db, "project_messages"), messageData);

    // Cria notificação para admin
    const notificationData: Omit<AdminNotification, 'id'> = {
      type: 'new_project_message',
      title: isNewClient ? 'Nova Mensagem - Cliente Novo!' : 'Nova Mensagem de Projeto',
      message: `${data.name} enviou uma mensagem sobre: ${data.projectType} (${messageType})`,
      clientId,
      messageId: messageRef.id,
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "admin_notifications"), notificationData);

    return {
      messageId: messageRef.id,
      clientId,
      isNewClient
    };
  } catch (error: any) {
    throw new Error("Erro ao criar mensagem de projeto: " + error.message);
  }
}

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
