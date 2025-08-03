'use client';

import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { 
  getContactMessages, 
  updateMessageStatus, 
  replyToMessage,
  ContactMessage 
} from "@/lib/firebase/firestore";
import { sendReplyEmail } from "@/lib/services/email";
import { 
  Mail, 
  MailOpen, 
  Reply, 
  Archive, 
  Clock, 
  User,
  Search,
  Filter
} from "lucide-react";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      const messagesData = await getContactMessages();
      setMessages(messagesData);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  async function handleStatusUpdate(messageId: string, newStatus: ContactMessage['status']) {
    try {
      await updateMessageStatus(messageId, newStatus);
      setMessages(messages.map(msg => 
        msg.id === messageId ? {...msg, status: newStatus} : msg
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  }

  async function handleSendReply() {
    if (!selectedMessage?.id || !replyText.trim()) return;

    try {
      setSendingReply(true);
      
      // 1. Salvar resposta no Firebase
      await replyToMessage(selectedMessage.id, replyText);
      
      // 2. Enviar resposta por email
      const emailSent = await sendReplyEmail({
        to_email: selectedMessage.email,
        to_name: selectedMessage.name,
        from_name: 'Prismas33',
        from_email: 'contato@prismas33.com',
        subject: `Re: ${selectedMessage.subject}`,
        message: replyText,
        original_subject: selectedMessage.subject,
        original_message: selectedMessage.message
      });
      
      // 3. Atualizar estado local
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id 
          ? {
              ...msg, 
              status: 'replied' as const, 
              reply: replyText,
              repliedAt: new Date()
            } 
          : msg
      ));
      
      setSelectedMessage({
        ...selectedMessage,
        status: 'replied',
        reply: replyText,
        repliedAt: new Date()
      });
      
      setReplyText("");
      
      // 4. Mostrar feedback
      if (emailSent) {
        alert("✅ Resposta enviada com sucesso por email!");
      } else {
        alert("⚠️ Resposta salva, mas houve um problema ao enviar o email. Verifique as configurações do EmailJS.");
      }
      
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    } finally {
      setSendingReply(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      read: "bg-blue-100 text-blue-800",
      replied: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      pending: "Pendente",
      read: "Lida",
      replied: "Respondida",
      archived: "Arquivada"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <Mail className="h-4 w-4 text-yellow-500" />;
      case 'read':
        return <MailOpen className="h-4 w-4 text-blue-500" />;
      case 'replied':
        return <Reply className="h-4 w-4 text-green-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mensagens de Contato</h1>
          <p className="text-gray-600 mt-2">Gerencie e responda às mensagens dos visitantes</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  Mensagens ({filteredMessages.length})
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
                ) : filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (message.status === 'pending') {
                            handleStatusUpdate(message.id!, 'read');
                          }
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedMessage?.id === message.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getStatusIcon(message.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {message.name}
                              </h3>
                              <div className="text-xs text-gray-500">
                                {message.createdAt.toLocaleDateString('pt-PT')}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-2">
                              {message.subject}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 truncate">
                                {message.email}
                              </span>
                              {getStatusBadge(message.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-8 w-8 text-gray-400" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedMessage.name}
                        </h2>
                        <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                      </div>
                    </div>
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedMessage.createdAt.toLocaleString('pt-PT')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Assunto: {selectedMessage.subject}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* Previous Reply */}
                  {selectedMessage.reply && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Sua Resposta 
                        {selectedMessage.repliedAt && (
                          <span className="text-sm text-gray-500 font-normal ml-2">
                            ({selectedMessage.repliedAt.toLocaleString('pt-PT')})
                          </span>
                        )}
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedMessage.reply}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {selectedMessage.reply ? "Nova Resposta" : "Responder"}
                    </h4>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite sua resposta..."
                    />
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        <select
                          value={selectedMessage.status}
                          onChange={(e) => handleStatusUpdate(selectedMessage.id!, e.target.value as ContactMessage['status'])}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="pending">Pendente</option>
                          <option value="read">Lida</option>
                          <option value="replied">Respondida</option>
                          <option value="archived">Arquivada</option>
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
                          onClick={handleSendReply}
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
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma mensagem</h3>
                  <p>Clique em uma mensagem na lista para visualizar e responder</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
