// Funções para gerenciar dados do Firestore (apenas funções que ainda não têm API routes)
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

// ===== PROPOSTAS (ainda não migradas para API) =====
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

// ===== MENSAGENS DE PROJETO (Sistema Organizado) - ainda não migradas =====
export interface ProjectMessage {
  id?: string;
  // Dados do Cliente
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  
  // Tipo de Mensagem
  messageType: 'novo-projeto' | 'projeto-existente' | 'orcamento' | 'suporte' | 'outro';
  projectReference?: string; // Nome do projeto se for projeto existente
  
  // Conteúdo
  subject: string;
  message: string;
  
  // Status e Organização
  status: 'pending' | 'in-review' | 'replied' | 'quoted' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'sales' | 'support' | 'technical' | 'billing';
  folderId?: string; // ID da pasta onde a mensagem está organizada
  
  // Gestão
  assignedTo?: string; // Admin que está a tratar
  tags: string[]; // Tags para organização (ex: ['website', 'ecommerce', 'urgent'])
  
  // Resposta
  adminReply?: string;
  repliedAt?: Date;
  repliedBy?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Metadados
  source: 'website-form' | 'email' | 'phone' | 'meeting';
  userAgent?: string;
  referrer?: string;
}

// Buscar todas as mensagens de projeto
export async function getProjectMessages() {
  try {
    const q = query(collection(db, "project_messages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      repliedAt: doc.data().repliedAt?.toDate() || undefined
    })) as ProjectMessage[];
  } catch (error: any) {
    throw new Error("Erro ao buscar mensagens de projeto: " + error.message);
  }
}

// Buscar mensagens por status
export async function getProjectMessagesByStatus(status: ProjectMessage['status']) {
  try {
    const q = query(
      collection(db, "project_messages"), 
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      repliedAt: doc.data().repliedAt?.toDate() || undefined
    })) as ProjectMessage[];
  } catch (error: any) {
    throw new Error("Erro ao buscar mensagens por status: " + error.message);
  }
}

// Atualizar status da mensagem
export async function updateProjectMessageStatus(
  id: string, 
  status: ProjectMessage['status'],
  assignedTo?: string
) {
  try {
    const messageRef = doc(db, "project_messages", id);
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }
    
    await updateDoc(messageRef, updateData);
  } catch (error: any) {
    throw new Error("Erro ao atualizar status da mensagem: " + error.message);
  }
}

// Responder a mensagem de projeto
export async function replyToProjectMessage(
  id: string, 
  reply: string, 
  repliedBy: string
) {
  try {
    const messageRef = doc(db, "project_messages", id);
    await updateDoc(messageRef, {
      adminReply: reply,
      repliedAt: new Date(),
      repliedBy,
      status: 'replied',
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao responder mensagem: " + error.message);
  }
}

// Adicionar tags a uma mensagem
export async function addTagsToProjectMessage(id: string, tags: string[]) {
  try {
    const messageRef = doc(db, "project_messages", id);
    await updateDoc(messageRef, {
      tags,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao adicionar tags: " + error.message);
  }
}

// Definir prioridade da mensagem
export async function setProjectMessagePriority(
  id: string, 
  priority: ProjectMessage['priority']
) {
  try {
    const messageRef = doc(db, "project_messages", id);
    await updateDoc(messageRef, {
      priority,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error("Erro ao definir prioridade: " + error.message);
  }
}

// Estatísticas das mensagens para dashboard
export async function getProjectMessagesStats() {
  try {
    const allMessages = await getProjectMessages();
    
    const stats = {
      total: allMessages.length,
      pending: allMessages.filter(m => m.status === 'pending').length,
      inReview: allMessages.filter(m => m.status === 'in-review').length,
      replied: allMessages.filter(m => m.status === 'replied').length,
      quoted: allMessages.filter(m => m.status === 'quoted').length,
      closed: allMessages.filter(m => m.status === 'closed').length,
      
      byType: {
        novoProjet: allMessages.filter(m => m.messageType === 'novo-projeto').length,
        projetoExistente: allMessages.filter(m => m.messageType === 'projeto-existente').length,
        orcamento: allMessages.filter(m => m.messageType === 'orcamento').length,
        suporte: allMessages.filter(m => m.messageType === 'suporte').length,
        outro: allMessages.filter(m => m.messageType === 'outro').length
      },
      
      byPriority: {
        urgent: allMessages.filter(m => m.priority === 'urgent').length,
        high: allMessages.filter(m => m.priority === 'high').length,
        medium: allMessages.filter(m => m.priority === 'medium').length,
        low: allMessages.filter(m => m.priority === 'low').length
      }
    };
    
    return stats;
  } catch (error: any) {
    throw new Error("Erro ao calcular estatísticas: " + error.message);
  }
}
