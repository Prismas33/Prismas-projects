// Funções para gerenciar mensagens no Firestore
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
  where,
  writeBatch
} from "firebase/firestore";
import { db } from "./config";

// Tipos de mensagens
export type MessageFolder = {
  id?: string;
  name: string;
  description?: string;
  createdAt: Date;
  type: 'project' | 'contact';
  messageCount?: number;
};

// ===== FUNÇÕES DE PASTA DE MENSAGENS =====

// Obter todas as pastas de mensagens (usando API)
export async function getMessageFolders(type: 'project' | 'contact'): Promise<MessageFolder[]> {
  try {
    const response = await fetch(`/api/message-folders?type=${type}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao buscar pastas de mensagens');
    }
    
    return result.data.map((folder: any) => ({
      ...folder,
      createdAt: new Date(folder.createdAt)
    }));
  } catch (error) {
    console.error("Erro ao buscar pastas de mensagens:", error);
    throw error;
  }
}

// Criar nova pasta de mensagens (usando API)
export async function createMessageFolder(folderData: Omit<MessageFolder, 'id' | 'createdAt' | 'messageCount'>): Promise<string> {
  try {
    const response = await fetch('/api/message-folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(folderData)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao criar pasta de mensagens');
    }
    
    return result.data.id;
  } catch (error) {
    console.error("Erro ao criar pasta de mensagens:", error);
    throw error;
  }
}

// Atualizar pasta de mensagens (usando API)
export async function updateMessageFolder(folderId: string, data: Partial<Omit<MessageFolder, 'id' | 'createdAt' | 'type' | 'messageCount'>>): Promise<void> {
  try {
    const response = await fetch(`/api/message-folders/${folderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao atualizar pasta de mensagens');
    }
  } catch (error) {
    console.error("Erro ao atualizar pasta de mensagens:", error);
    throw error;
  }
}

// Excluir pasta de mensagens (apenas se estiver vazia) (usando API)
export async function deleteMessageFolder(folderId: string, type: 'project' | 'contact'): Promise<void> {
  try {
    const response = await fetch(`/api/message-folders/${folderId}?type=${type}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao excluir pasta de mensagens');
    }
  } catch (error) {
    console.error("Erro ao excluir pasta de mensagens:", error);
    throw error;
  }
}

// ===== FUNÇÕES DE GERENCIAMENTO DE MENSAGENS =====

// Mover mensagem para uma pasta (usando API)
export async function moveProjectMessageToFolder(messageId: string, folderId: string | null): Promise<void> {
  try {
    const response = await fetch('/api/message-folders/messages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId,
        folderId,
        type: 'project'
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao mover mensagem para pasta');
    }
  } catch (error) {
    console.error("Erro ao mover mensagem para pasta:", error);
    throw error;
  }
}

export async function moveContactMessageToFolder(messageId: string, folderId: string | null): Promise<void> {
  try {
    const response = await fetch('/api/message-folders/messages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId,
        folderId,
        type: 'contact'
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao mover mensagem para pasta');
    }
  } catch (error) {
    console.error("Erro ao mover mensagem para pasta:", error);
    throw error;
  }
}

// Excluir mensagem de projeto (usando API)
export async function deleteProjectMessage(messageId: string): Promise<void> {
  try {
    const response = await fetch(`/api/messages/${messageId}?type=project`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao excluir mensagem de projeto');
    }
  } catch (error) {
    console.error("Erro ao excluir mensagem de projeto:", error);
    throw error;
  }
}

// Excluir mensagem de contato (usando API)
export async function deleteContactMessage(messageId: string): Promise<void> {
  try {
    const response = await fetch(`/api/messages/${messageId}?type=contact`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao excluir mensagem de contato');
    }
  } catch (error) {
    console.error("Erro ao excluir mensagem de contato:", error);
    throw error;
  }
}

// Obter mensagens por pasta (usando API)
export async function getProjectMessagesByFolder(folderId: string | null): Promise<any[]> {
  try {
    const folderIdParam = folderId === null ? 'null' : folderId;
    const response = await fetch(`/api/message-folders/messages?type=project&folderId=${folderIdParam}`);
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
  } catch (error) {
    console.error("Erro ao buscar mensagens por pasta:", error);
    throw error;
  }
}

export async function getContactMessagesByFolder(folderId: string | null): Promise<any[]> {
  try {
    const folderIdParam = folderId === null ? 'null' : folderId;
    const response = await fetch(`/api/message-folders/messages?type=contact&folderId=${folderIdParam}`);
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
  } catch (error) {
    console.error("Erro ao buscar mensagens por pasta:", error);
    throw error;
  }
}
