// Funções para interagir com as APIs do admin de forma segura
import { adminDb, isFirebaseAdminConfigured } from '../firebase/admin';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  clientId?: string;
  messageId?: string;
  read: boolean;
  createdAt: Date;
  timestamp: Date;
  // Campos adicionais usados no dashboard
  appName?: string;
  email?: string;
}

export interface ContactMessage {
  id: string;
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

export interface Client {
  id: string;
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

export interface Project {
  id: string;
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

// ===== NOTIFICAÇÕES =====
export async function getNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/notifications');
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar notificações');
  }
  
  return result.data.map((notification: any) => ({
    ...notification,
    timestamp: new Date(notification.timestamp),
    createdAt: new Date(notification.createdAt || notification.timestamp)
  }));
}

export async function updateNotificationStatus(id: string, read: boolean): Promise<void> {
  const response = await fetch(`/api/notifications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao atualizar notificação');
  }
}

// ===== MENSAGENS =====
export async function getContactMessages(): Promise<ContactMessage[]> {
  const response = await fetch('/api/messages');
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar mensagens');
  }
  
  return result.data.map((message: any) => ({
    ...message,
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
    repliedAt: message.repliedAt ? new Date(message.repliedAt) : undefined
  }));
}

export async function updateMessageStatus(id: string, status: ContactMessage['status']): Promise<void> {
  const response = await fetch(`/api/messages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao atualizar mensagem');
  }
}

export async function replyToMessage(id: string, reply: string): Promise<void> {
  const response = await fetch(`/api/messages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao responder mensagem');
  }
}

// ===== CLIENTES =====
export async function getClients(): Promise<Client[]> {
  const response = await fetch('/api/clients');
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar clientes');
  }
  
  return result.data.map((client: any) => ({
    ...client,
    lastContact: new Date(client.lastContact),
    createdAt: new Date(client.createdAt),
    updatedAt: new Date(client.updatedAt)
  }));
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao criar cliente');
  }
  
  return result.data.id;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao atualizar cliente');
  }
}

export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao deletar cliente');
  }
}

// ===== PROJETOS =====
export async function getProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects');
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar projetos');
  }
  
  return result.data.map((project: any) => ({
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt)
  }));
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao criar projeto');
  }
  
  return result.data.id;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao atualizar projeto');
  }
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao deletar projeto');
  }
}

// ===== PROPOSTAS =====
export async function getProposals(): Promise<Proposal[]> {
  const response = await fetch('/api/proposals');
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar propostas');
  }
  
  return result.data.map((proposal: any) => ({
    ...proposal,
    validUntil: new Date(proposal.validUntil),
    sentAt: proposal.sentAt ? new Date(proposal.sentAt) : undefined,
    createdAt: new Date(proposal.createdAt),
    updatedAt: new Date(proposal.updatedAt)
  }));
}

export async function createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const response = await fetch('/api/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proposal),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao criar proposta');
  }
  
  return result.data.id;
}

export async function updateProposal(id: string, updates: Partial<Proposal>): Promise<void> {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao atualizar proposta');
  }
}

export async function deleteProposal(id: string): Promise<void> {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao deletar proposta');
  }
}

// ===== PASTAS DE MENSAGENS =====
export interface MessageFolder {
  id: string;
  name: string;
  description: string;
  type: 'project' | 'contact';
  createdAt: Date;
  messageCount: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  folderId: string | null;
  read: boolean;
  replied: boolean;
  repliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getMessageFolders(type: 'project' | 'contact'): Promise<MessageFolder[]> {
  const response = await fetch(`/api/message-folders?type=${type}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar pastas de mensagens');
  }
  
  return result.data.map((folder: any) => ({
    ...folder,
    createdAt: new Date(folder.createdAt)
  }));
}

export async function createMessageFolder(folder: {
  name: string;
  description?: string;
  type: 'project' | 'contact';
}): Promise<string> {
  const response = await fetch('/api/message-folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(folder),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao criar pasta de mensagens');
  }
  
  return result.data.id;
}

export async function getMessagesByFolder(folderId: string | null, type: 'project' | 'contact'): Promise<Message[]> {
  const folderParam = folderId === null ? 'null' : folderId;
  const response = await fetch(`/api/message-folders/messages?folderId=${folderParam}&type=${type}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao buscar mensagens por pasta');
  }
  
  return result.data.map((message: any) => ({
    ...message,
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
    repliedAt: message.repliedAt ? new Date(message.repliedAt) : null
  }));
}

export async function moveMessageToFolder(
  messageId: string, 
  folderId: string | null, 
  type: 'project' | 'contact'
): Promise<void> {
  const response = await fetch('/api/message-folders/messages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, folderId, type }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro ao mover mensagem para pasta');
  }
}
