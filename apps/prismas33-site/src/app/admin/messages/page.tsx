'use client';

import { useState, useEffect, useRef } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
// Removido imports de ContactMessage - focamos só em project messages
import { 
  getProjectMessages,
  updateProjectMessageStatus,
  replyToProjectMessage,
  setProjectMessagePriority,
  addTagsToProjectMessage,
  type ProjectMessage
} from "@/lib/firebase/firestore";
import {
  getMessageFolders,
  createMessageFolder,
  updateMessageFolder,
  deleteMessageFolder,
  moveProjectMessageToFolder,
  deleteProjectMessage,
  getProjectMessagesByFolder,
  type MessageFolder
} from "@/lib/firebase/messageUtils";
import { 
  Mail, 
  MailOpen, 
  Reply, 
  Archive, 
  Clock, 
  User,
  Search,
  Filter,
  Tag,
  AlertCircle,
  CheckCircle,
  Folder,
  FolderPlus,
  Trash2,
  Move,
  Edit,
  MessageSquare,
  Star,
  Building,
  Phone,
  FileText,
  Send
} from "lucide-react";

export default function MessagesPage() {
  // Estados para mensagens de projeto (única fonte de mensagens)
  const [projectMessages, setProjectMessages] = useState<ProjectMessage[]>([]);
  const [selectedProjectMessage, setSelectedProjectMessage] = useState<ProjectMessage | null>(null);
  
  // Estados para pastas
  const [projectFolders, setProjectFolders] = useState<MessageFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [sendingProposal, setSendingProposal] = useState(false);
  
  // Ref para o textarea
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMessages();
    loadFolders();
    loadProposals();
  }, []);

  useEffect(() => {
    loadMessages();
  }, [selectedFolder]); // Removido loadFolders daqui para evitar conflitos

  async function loadFolders() {
    try {
      const folders = await getMessageFolders('project');
      setProjectFolders(folders);
    } catch (error) {
      console.error("Erro ao carregar pastas:", error);
    }
  }

  async function loadProposals() {
    try {
      const response = await fetch('/api/proposals');
      const result = await response.json();
      if (result.success) {
        setProposals(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar propostas:", error);
    }
  }

  async function loadMessages() {
    try {
      setLoading(true);
      
      let messagesData;
      if (selectedFolder === null) {
        // Buscar todas as mensagens sem pasta (caixa de entrada)
        messagesData = await getProjectMessages();
        // Filtrar apenas mensagens que não têm folderId
        messagesData = messagesData.filter(msg => !msg.folderId);
      } else {
        // Buscar mensagens da pasta selecionada
        messagesData = await getProjectMessagesByFolder(selectedFolder);
      }
      setProjectMessages(messagesData);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  }

  // Estados comuns
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sendingReply, setSendingReply] = useState(false);

  // Filtros para mensagens de projeto
  const filteredProjectMessages = projectMessages.filter(message => {
    const matchesSearch = 
      message.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.messageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.projectReference && message.projectReference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  })
  // Ordena mensagens: não lidas primeiro, depois por data (mais recentes)
  .sort((a, b) => {
    // Se um está pendente e outro não, o pendente vem primeiro
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // Se ambos têm o mesmo status, ordena por data (mais recente primeiro)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // Funções para mensagens de projeto
  async function handleProjectStatusUpdate(messageId: string, newStatus: ProjectMessage['status']) {
    try {
      await updateProjectMessageStatus(messageId, newStatus);
      setProjectMessages(projectMessages.map(msg => 
        msg.id === messageId ? {...msg, status: newStatus} : msg
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  }

  async function handleProjectPriorityUpdate(messageId: string, priority: ProjectMessage['priority']) {
    try {
      await setProjectMessagePriority(messageId, priority);
      setProjectMessages(projectMessages.map(msg => 
        msg.id === messageId ? {...msg, priority} : msg
      ));
    } catch (error) {
      console.error("Erro ao atualizar prioridade:", error);
    }
  }

  async function handleProjectTagsUpdate(messageId: string, tags: string[]) {
    try {
      await addTagsToProjectMessage(messageId, tags);
      setProjectMessages(projectMessages.map(msg => 
        msg.id === messageId ? {...msg, tags} : msg
      ));
    } catch (error) {
      console.error("Erro ao atualizar tags:", error);
    }
  }
  
  // Funções para gerenciamento de pastas
  async function handleCreateFolder() {
    if (!folderName.trim()) return;
    
    try {
      if (editingFolderId) {
        // Atualizar pasta existente
        await updateMessageFolder(editingFolderId, {
          name: folderName,
          description: folderDescription
        });
      } else {
        // Criar nova pasta
        await createMessageFolder({
          name: folderName,
          description: folderDescription,
          type: 'project'
        });
      }
      
      // Limpar campos e recarregar pastas
      setFolderName("");
      setFolderDescription("");
      setEditingFolderId(null);
      setShowFolderModal(false);
      await loadFolders();
    } catch (error) {
      console.error("Erro ao criar/atualizar pasta:", error);
      alert("Erro ao criar/atualizar pasta: " + error);
    }
  }
  
  async function handleEditFolder(folder: MessageFolder) {
    setFolderName(folder.name);
    setFolderDescription(folder.description || "");
    setEditingFolderId(folder.id!);
    setShowFolderModal(true);
  }
  
  async function handleDeleteFolder(folderId: string) {
    try {
      await deleteMessageFolder(folderId, 'project');
      await loadFolders();
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
    } catch (error) {
      console.error("Erro ao excluir pasta:", error);
      alert("Erro ao excluir pasta: " + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  // Funções para excluir e mover mensagens
  async function handleDeleteMessage(messageId: string) {
    if (!confirm("Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.")) return;
    
    try {
      await deleteProjectMessage(messageId);
      setProjectMessages(projectMessages.filter(msg => msg.id !== messageId));
      if (selectedProjectMessage?.id === messageId) {
        setSelectedProjectMessage(null);
      }
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      alert("Erro ao excluir mensagem: " + error);
    }
  }
  
  async function handleMoveMessageToFolder(messageId: string, folderId: string | null) {
    try {
      await moveProjectMessageToFolder(messageId, folderId);
      // Atualizar estado local ou recarregar mensagens
      if (folderId !== selectedFolder) {
        // Remover a mensagem da lista atual
        setProjectMessages(projectMessages.filter(msg => msg.id !== messageId));
      }
      
      await loadFolders(); // Atualiza contagem de mensagens nas pastas
      setShowMoveToFolderModal(false);
    } catch (error) {
      console.error("Erro ao mover mensagem para pasta:", error);
      alert("Erro ao mover mensagem: " + error);
    }
  }

  async function handleSendReply() {
    if (!selectedProjectMessage?.id || !replyText.trim()) return;

    try {
      setSendingReply(true);
      
      // Responder mensagem de projeto
      await replyToProjectMessage(selectedProjectMessage.id, replyText, 'Admin');
      
      // Enviar resposta por email via API
      let emailSent = false;
      try {
        const response = await fetch('/api/send-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientEmail: selectedProjectMessage.clientEmail,
            clientName: selectedProjectMessage.clientName,
            subject: `${selectedProjectMessage.subject} - Resposta da Prismas33`,
            message: replyText,
            originalMessage: selectedProjectMessage.message
          })
        });
        
        const result = await response.json();
        emailSent = result.success;
        
        if (!emailSent) {
          console.error('Erro ao enviar email:', result.error);
        }
      } catch (error) {
        console.error('Erro na API de email:', error);
      }
      
      setProjectMessages(projectMessages.map(msg => 
        msg.id === selectedProjectMessage.id 
          ? {
              ...msg, 
              status: 'replied' as const, 
              adminReply: replyText,
              repliedAt: new Date(),
              repliedBy: 'Admin'
            } 
          : msg
      ));
      
      setSelectedProjectMessage({
        ...selectedProjectMessage!,
        status: 'replied',
        adminReply: replyText,
        repliedAt: new Date(),
        repliedBy: 'Admin'
      });
      
      if (emailSent) {
        alert("✅ Resposta enviada com sucesso por email!");
      } else {
        alert("⚠️ Resposta salva, mas houve um problema ao enviar o email.");
      }
      
      setReplyText("");
      
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    } finally {
      setSendingReply(false);
    }
  }

  async function handleSendProposal() {
    if (!selectedProjectMessage?.id || !selectedProposal) return;

    try {
      setSendingProposal(true);
      
      // Gerar PDF da proposta e enviar por email
      const response = await fetch('/api/send-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedProjectMessage.id,
          proposalId: selectedProposal.id,
          clientEmail: selectedProjectMessage.clientEmail,
          clientName: selectedProjectMessage.clientName,
          subject: `Proposta - ${selectedProposal.title || 'Projeto'}`,
          messageText: `Segue em anexo a proposta para o seu projeto.\n\nCumprimentos,\nEquipe Prismas33`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Atualizar status da mensagem para "quoted"
        await handleProjectStatusUpdate(selectedProjectMessage.id, 'quoted');
        
        alert("✅ Proposta enviada com sucesso por email!");
        setShowProposalModal(false);
        setSelectedProposal(null);
      } else {
        alert("❌ Erro ao enviar proposta: " + result.error);
      }
      
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
      alert("❌ Erro ao enviar proposta");
    } finally {
      setSendingProposal(false);
    }
  }

  // Componente para item de mensagem de projeto
  function ProjectMessageItem({ message, isSelected, onSelect }: {
    message: ProjectMessage;
    isSelected: boolean;
    onSelect: () => void;
  }) {
    return (
      <div
        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getProjectStatusIcon(message.status)}
          </div>
          <div className="flex-1 min-w-0" onClick={onSelect}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {message.clientName}
              </h3>
              <div className="flex items-center space-x-2">
                {getPriorityBadge(message.priority)}
                <div className="text-xs text-gray-500">
                  {message.createdAt.toLocaleDateString('pt-PT')}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 truncate mb-2">
              {message.subject}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {getMessageTypeLabel(message.messageType)}
              </span>
              {getStatusBadge(message.status)}
            </div>
            {message.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {message.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{message.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
          
          {/* Botões de ações rápidas */}
          <div className="flex flex-col space-y-2 ml-2" onClick={e => e.stopPropagation()}>
            <button 
              className="p-1 rounded hover:bg-gray-200 text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveToFolderModal(true);
                onSelect();
              }}
              title="Mover para pasta"
            >
              <Move className="h-4 w-4" />
            </button>
            <button 
              className="p-1 rounded hover:bg-red-100 text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMessage(message.id!);
              }}
              title="Excluir mensagem"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      'in-review': "bg-blue-100 text-blue-800",
      read: "bg-blue-100 text-blue-800",
      replied: "bg-green-100 text-green-800",
      quoted: "bg-purple-100 text-purple-800",
      closed: "bg-gray-100 text-gray-800",
      archived: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      pending: "Pendente",
      'in-review': "Em Análise",
      read: "Lida",
      replied: "Respondida",
      quoted: "Orçamentada",
      closed: "Fechada",
      archived: "Arquivada"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  function getPriorityBadge(priority: string) {
    const styles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      urgent: "Urgente"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  }

  function getMessageTypeLabel(type: string) {
    const labels = {
      'novo-projeto': 'Novo Projeto',
      'projeto-existente': 'Projeto Existente',
      'orcamento': 'Orçamento',
      'suporte': 'Suporte',
      'outro': 'Outro'
    };
    return labels[type as keyof typeof labels] || type;
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <Mail className="h-4 w-4 text-yellow-500" />;
      case 'read':
      case 'in-review':
        return <MailOpen className="h-4 w-4 text-blue-500" />;
      case 'replied':
        return <Reply className="h-4 w-4 text-green-500" />;
      case 'quoted':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  }

  function getProjectStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in-review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'replied':
        return <Reply className="h-4 w-4 text-green-500" />;
      case 'quoted':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  }

  // Componente para detalhes da mensagem de projeto
  function ProjectMessageDetail({ 
    message, 
    onStatusUpdate, 
    onPriorityUpdate,
    onTagsUpdate,
    replyText, 
    setReplyText, 
    onSendReply, 
    sendingReply 
  }: {
    message: ProjectMessage;
    onStatusUpdate: (id: string, status: ProjectMessage['status']) => void;
    onPriorityUpdate: (id: string, priority: ProjectMessage['priority']) => void;
    onTagsUpdate: (id: string, tags: string[]) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    onSendReply: () => void;
    sendingReply: boolean;
  }) {
    return (
      <>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {message.clientName}
                </h2>
                <p className="text-sm text-gray-600">{message.clientEmail}</p>
                {message.clientPhone && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Phone className="h-3 w-3" />
                    <span>{message.clientPhone}</span>
                  </div>
                )}
                {message.clientCompany && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Building className="h-3 w-3" />
                    <span>{message.clientCompany}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {getPriorityBadge(message.priority)}
              {getStatusBadge(message.status)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{message.createdAt.toLocaleString('pt-PT')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Tag className="h-4 w-4" />
              <span>{getMessageTypeLabel(message.messageType)}</span>
            </div>
            {message.projectReference && (
              <span className="text-purple-600">Projeto: {message.projectReference}</span>
            )}
          </div>

          {/* Tags */}
          {message.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Assunto: {message.subject}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>

          {/* Previous Reply */}
          {message.adminReply && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Sua Resposta 
                {message.repliedAt && (
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    ({message.repliedAt.toLocaleString('pt-PT')})
                  </span>
                )}
              </h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {message.adminReply}
                </p>
              </div>
            </div>
          )}

          {/* Reply Form */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              {message.adminReply ? "Nova Resposta" : "Responder"}
            </h4>
            <textarea
              ref={replyTextareaRef}
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                // Mantenha o foco no elemento após o update
                const cursorPosition = e.target.selectionStart;
                setTimeout(() => {
                  if (replyTextareaRef.current) {
                    replyTextareaRef.current.focus();
                    replyTextareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
                  }
                }, 0);
              }}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Digite sua resposta..."
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <select
                  value={message.status}
                  onChange={(e) => onStatusUpdate(message.id!, e.target.value as ProjectMessage['status'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="pending">Pendente</option>
                  <option value="in-review">Em Análise</option>
                  <option value="replied">Respondida</option>
                  <option value="quoted">Orçamentada</option>
                  <option value="closed">Fechada</option>
                </select>
                <select
                  value={message.priority}
                  onChange={(e) => onPriorityUpdate(message.id!, e.target.value as ProjectMessage['priority'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setReplyText("")}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Anexar Proposta</span>
                </button>
                <button
                  onClick={onSendReply}
                  disabled={!replyText.trim() || sendingReply}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Reply className="h-4 w-4" />
                  <span>{sendingReply ? "Enviando..." : "Responder"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Componente para pastas
  function FolderItem({ folder, isActive, onClick, onEdit, onDelete }: {
    folder: MessageFolder;
    isActive: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }) {
    return (
      <div 
        className={`flex items-center justify-between p-2 my-1 rounded cursor-pointer hover:bg-gray-100 ${isActive ? 'bg-blue-100' : ''}`}
      >
        <div className="flex items-center space-x-2" onClick={onClick}>
          <Folder className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
          <span className="text-sm font-medium">{folder.name}</span>
          <span className="text-xs text-gray-500">({folder.messageCount || 0})</span>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 rounded hover:bg-gray-200"
            title="Editar pasta"
          >
            <Edit className="h-3 w-3 text-gray-500" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-red-100"
            disabled={folder.messageCount! > 0}
            title={folder.messageCount! > 0 ? "Remova todas as mensagens antes de excluir" : "Excluir pasta"}
          >
            <Trash2 className={`h-3 w-3 ${folder.messageCount! > 0 ? 'text-gray-300' : 'text-red-500'}`} />
          </button>
        </div>
      </div>
    );
  }

  // Modal para criar/editar pastas
  function FolderModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium mb-4">
            {editingFolderId ? 'Editar Pasta' : 'Nova Pasta'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Pasta</label>
              <input
                type="text"
                autoFocus
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && folderName.trim()) {
                    handleCreateFolder();
                  }
                  if (e.key === 'Escape') {
                    setShowFolderModal(false);
                    setFolderName("");
                    setFolderDescription("");
                    setEditingFolderId(null);
                  }
                }}
                placeholder="Digite o nome da pasta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
              <textarea
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                placeholder="Descrição da pasta"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowFolderModal(false);
                setFolderName("");
                setFolderDescription("");
                setEditingFolderId(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={!folderName.trim()}
            >
              {editingFolderId ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal para mover mensagem para pasta
  function MoveToFolderModal() {
    if (!selectedProjectMessage) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium mb-4">Mover para pasta</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <div 
              className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => {
                handleMoveMessageToFolder(selectedProjectMessage.id!, null);
                setShowMoveToFolderModal(false);
              }}
            >
              <Mail className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium">Caixa de entrada</span>
            </div>
            
            {projectFolders.map((folder) => (
              <div 
                key={folder.id} 
                className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  handleMoveMessageToFolder(selectedProjectMessage.id!, folder.id!);
                  setShowMoveToFolderModal(false);
                }}
              >
                <Folder className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium">{folder.name}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setShowMoveToFolderModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal para anexar proposta
  function ProposalModal() {
    if (!selectedProjectMessage) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Anexar Proposta</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Selecione uma proposta para enviar para <strong>{selectedProjectMessage.clientName}</strong> ({selectedProjectMessage.clientEmail})
            </p>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
            {proposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma proposta encontrada</p>
                <p className="text-sm">Crie propostas primeiro para poder anexá-las</p>
              </div>
            ) : (
              proposals.map((proposal) => (
                <div 
                  key={proposal.id} 
                  className={`flex items-center justify-between p-4 rounded border cursor-pointer hover:bg-gray-50 ${
                    selectedProposal?.id === proposal.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{proposal.title || `Proposta #${proposal.id}`}</h4>
                      <p className="text-sm text-gray-600">
                        {proposal.description && (proposal.description.length > 100 ? 
                          proposal.description.substring(0, 100) + '...' : 
                          proposal.description
                        )}
                      </p>
                      <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                        {proposal.value && <span>Valor: €{proposal.value}</span>}
                        {proposal.createdAt && <span>Criada: {new Date(proposal.createdAt).toLocaleDateString('pt-PT')}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {selectedProposal?.id === proposal.id && (
                    <div className="text-purple-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setShowProposalModal(false);
                setSelectedProposal(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSendProposal}
                disabled={!selectedProposal || sendingProposal}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{sendingProposal ? "Enviando..." : "Enviar Proposta"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mensagens de Projeto</h1>
              <p className="text-gray-600 mt-2">Gerencie e responda às mensagens dos visitantes ({projectMessages.length} total)</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Nova Pasta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="read">Lidas</option>
                <option value="replied">Respondidas</option>
                <option value="archived">Arquivadas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Folder Sidebar - Coluna mais estreita */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Pastas</h3>
              
              {/* Caixa de entrada */}
              <div 
                className={`flex items-center justify-between p-2 my-1 rounded cursor-pointer hover:bg-gray-100 ${selectedFolder === null ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedFolder(null)}
              >
                <div className="flex items-center space-x-2">
                  <Mail className={`h-4 w-4 ${selectedFolder === null ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">Caixa de Entrada</span>
                  <span className="text-xs text-gray-500">({projectMessages.filter(m => !m.folderId).length})</span>
                </div>
              </div>
              
              {/* Pastas personalizadas */}
              {projectFolders.map((folder) => (
                <FolderItem 
                  key={folder.id}
                  folder={folder}
                  isActive={selectedFolder === folder.id}
                  onClick={() => setSelectedFolder(folder.id!)}
                  onEdit={() => handleEditFolder(folder)}
                  onDelete={() => handleDeleteFolder(folder.id!)}
                />
              ))}
            </div>
          </div>

          {/* Messages List - Coluna mais larga */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  {selectedFolder === null ? 'Caixa de Entrada' : projectFolders.find(f => f.id === selectedFolder)?.name || 'Pasta'} 
                  ({filteredProjectMessages.length})
                </h2>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start space-x-3 p-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredProjectMessages.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma mensagem de projeto encontrada</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredProjectMessages.map((message) => (
                          <ProjectMessageItem 
                            key={message.id}
                            message={message}
                            isSelected={selectedProjectMessage?.id === message.id}
                            onSelect={() => {
                              setSelectedProjectMessage(message);
                              if (message.status === 'pending') {
                                handleProjectStatusUpdate(message.id!, 'in-review');
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-3">
            {selectedProjectMessage ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <ProjectMessageDetail 
                  message={selectedProjectMessage!}
                  onStatusUpdate={handleProjectStatusUpdate}
                  onPriorityUpdate={handleProjectPriorityUpdate}
                  onTagsUpdate={handleProjectTagsUpdate}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onSendReply={handleSendReply}
                  sendingReply={sendingReply}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma mensagem de projeto</h3>
                  <p>Clique em uma mensagem na lista para visualizar e responder</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modais */}
        {showFolderModal && <FolderModal />}
        {showMoveToFolderModal && <MoveToFolderModal />}
        {showProposalModal && <ProposalModal />}
      </div>
    </AdminDashboardLayout>
  );
}
