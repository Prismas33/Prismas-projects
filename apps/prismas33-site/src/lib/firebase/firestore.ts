// Funções para gerenciar dados do Firestore
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { db, storage } from "./config";

// ===== UPLOAD DE IMAGENS =====
export async function uploadProjectImage(file: File, projectName: string): Promise<string> {
  try {
    // Criar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `projects/${fileName}`);
    
    // Fazer upload
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    throw new Error("Erro ao fazer upload da imagem: " + error.message);
  }
}

export async function deleteProjectImage(imageUrl: string): Promise<void> {
  try {
    // Extrair o path da URL para deletar
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    console.warn("Erro ao deletar imagem:", error.message);
  }
}

// ===== PROJETOS =====
export interface Project {
  id?: string;
  name: string;
  description: string;
  category: 'premium' | 'enterprise' | 'creative' | 'fintech';
  images: string[];
  features: string[];
  demoUrl?: string;
  status: 'coming-soon' | 'development' | 'ready' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const projectData = {
      ...project,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "projects"), projectData);
    return docRef.id;
  } catch (error: any) {
    throw new Error("Erro ao criar projeto: " + error.message);
  }
}

export async function getProjects() {
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Project[];
  } catch (error: any) {
    throw new Error("Erro ao buscar projetos: " + error.message);
  }
}

export async function updateProject(id: string, updates: Partial<Project>) {
  try {
    const projectRef = doc(db, "projects", id);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao atualizar projeto: " + error.message);
  }
}

export async function deleteProject(id: string) {
  try {
    await deleteDoc(doc(db, "projects", id));
  } catch (error: any) {
    throw new Error("Erro ao deletar projeto: " + error.message);
  }
}

// ===== MENSAGENS DE CONTATO =====
export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  reply?: string;
  repliedAt?: Date;
}

export async function getContactMessages() {
  try {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      repliedAt: doc.data().repliedAt?.toDate() || undefined
    })) as ContactMessage[];
  } catch (error: any) {
    throw new Error("Erro ao buscar mensagens: " + error.message);
  }
}

export async function updateMessageStatus(id: string, status: ContactMessage['status']) {
  try {
    const messageRef = doc(db, "messages", id);
    await updateDoc(messageRef, {
      status,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao atualizar status da mensagem: " + error.message);
  }
}

export async function replyToMessage(id: string, reply: string) {
  try {
    const messageRef = doc(db, "messages", id);
    await updateDoc(messageRef, {
      reply,
      repliedAt: new Date(),
      status: 'replied',
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao responder mensagem: " + error.message);
  }
}

// ===== NOTIFICAÇÕES (emails coletados) =====
export interface Notification {
  id?: string;
  email: string;
  appName: string;
  timestamp: Date;
  userAgent?: string;
  language?: string;
  referrer?: string;
  status: 'pending' | 'contacted' | 'converted' | 'ignored';
}

export async function getNotifications() {
  try {
    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Notification[];
  } catch (error: any) {
    throw new Error("Erro ao buscar notificações: " + error.message);
  }
}

export async function updateNotificationStatus(id: string, status: Notification['status']) {
  try {
    const notificationRef = doc(db, "notifications", id);
    await updateDoc(notificationRef, { status });
  } catch (error: any) {
    throw new Error("Erro ao atualizar status da notificação: " + error.message);
  }
}

// ===== CLIENTES (CRM) =====
export interface Client {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'prospect' | 'client' | 'inactive';
  source: 'website' | 'referral' | 'social' | 'email' | 'other';
  notes: string;
  lastContact: Date;
  createdAt: Date;
  updatedAt: Date;
  proposalsSent?: number;
  projectsCompleted?: number;
  totalValue?: number;
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const clientData = {
      ...client,
      createdAt: new Date(),
      updatedAt: new Date(),
      proposalsSent: 0,
      projectsCompleted: 0,
      totalValue: 0
    };
    
    const docRef = await addDoc(collection(db, "clients"), clientData);
    return docRef.id;
  } catch (error: any) {
    throw new Error("Erro ao criar cliente: " + error.message);
  }
}

export async function getClients() {
  try {
    const q = query(collection(db, "clients"), orderBy("lastContact", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastContact: doc.data().lastContact?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Client[];
  } catch (error: any) {
    throw new Error("Erro ao buscar clientes: " + error.message);
  }
}

export async function updateClient(id: string, updates: Partial<Client>) {
  try {
    const clientRef = doc(db, "clients", id);
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao atualizar cliente: " + error.message);
  }
}

export async function deleteClient(id: string) {
  try {
    await deleteDoc(doc(db, "clients", id));
  } catch (error: any) {
    throw new Error("Erro ao deletar cliente: " + error.message);
  }
}

// ===== PROPOSTAS =====
export interface Proposal {
  id?: string;
  clientId: string;
  title: string;
  description: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    price: number;
  }[];
  totalValue: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export async function createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const proposalData = {
      ...proposal,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "proposals"), proposalData);
    
    // Atualizar contador de propostas do cliente
    const clientRef = doc(db, "clients", proposal.clientId);
    const clientDoc = await getDoc(clientRef);
    if (clientDoc.exists()) {
      const currentProposals = clientDoc.data().proposalsSent || 0;
      await updateDoc(clientRef, {
        proposalsSent: currentProposals + 1,
        updatedAt: new Date()
      });
    }
    
    return docRef.id;
  } catch (error: any) {
    throw new Error("Erro ao criar proposta: " + error.message);
  }
}

export async function getProposals() {
  try {
    const q = query(collection(db, "proposals"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      validUntil: doc.data().validUntil?.toDate() || new Date(),
      sentAt: doc.data().sentAt?.toDate() || undefined,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Proposal[];
  } catch (error: any) {
    throw new Error("Erro ao buscar propostas: " + error.message);
  }
}

export async function updateProposal(id: string, updates: Partial<Proposal>) {
  try {
    const proposalRef = doc(db, "proposals", id);
    await updateDoc(proposalRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao atualizar proposta: " + error.message);
  }
}

export async function deleteProposal(id: string) {
  try {
    await deleteDoc(doc(db, "proposals", id));
  } catch (error: any) {
    throw new Error("Erro ao deletar proposta: " + error.message);
  }
}
