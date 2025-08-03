'use client';

import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { 
  getProposals, 
  getClients,
  createProposal, 
  updateProposal, 
  deleteProposal,
  Proposal,
  Client 
} from "@/lib/firebase/firestore";
import { sendProposalEmail } from "@/lib/services/email";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  DollarSign,
  Send,
  Check,
  X,
  Clock,
  Eye
} from "lucide-react";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [proposalsData, clientsData] = await Promise.all([
        getProposals(),
        getClients()
      ]);
      setProposals(proposalsData);
      setClients(clientsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  const proposalsWithClients = proposals.map(proposal => {
    const client = clients.find(c => c.id === proposal.clientId);
    return { ...proposal, client };
  });

  const filteredProposals = proposalsWithClients.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proposal.client?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proposal.client?.company || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  async function handleDeleteProposal(id: string) {
    if (confirm("Tem certeza que deseja deletar esta proposta?")) {
      try {
        await deleteProposal(id);
        setProposals(proposals.filter(p => p.id !== id));
      } catch (error) {
        console.error("Erro ao deletar proposta:", error);
      }
    }
  }

  async function handleSendProposal(proposal: Proposal) {
    try {
      const client = clients.find(c => c.id === proposal.clientId);
      if (!client) {
        alert("Cliente não encontrado!");
        return;
      }

      // Enviar proposta por email
      const emailSent = await sendProposalEmail({
        to_email: client.email,
        to_name: client.name,
        client_company: client.company,
        proposal_title: proposal.title,
        proposal_description: proposal.description,
        services: proposal.items.map(item => ({
          name: item.name,
          description: item.description,
          price: item.price * item.quantity
        })),
        total_amount: proposal.totalValue,
        valid_until: proposal.validUntil.toLocaleDateString('pt-PT'),
        proposal_id: proposal.id || ''
      });

      if (emailSent) {
        // Atualizar status para "sent"
        if (proposal.id) {
          await updateProposal(proposal.id, { 
            status: 'sent',
            sentAt: new Date()
          });
          
          // Atualizar estado local
          setProposals(proposals.map(p => 
            p.id === proposal.id 
              ? { ...p, status: 'sent' as const, sentAt: new Date() }
              : p
          ));
        }
        
        alert("✅ Proposta enviada com sucesso por email!");
      } else {
        alert("❌ Erro ao enviar proposta por email. Verifique as configurações do EmailJS.");
      }
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
      alert("❌ Erro ao enviar proposta. Tente novamente.");
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-yellow-100 text-yellow-800"
    };
    
    const labels = {
      draft: "Rascunho",
      sent: "Enviada",
      accepted: "Aceita",
      rejected: "Rejeitada",
      expired: "Expirada"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  }

  // Estatísticas
  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    totalValue: proposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.totalValue, 0)
  };

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
            <p className="text-gray-600 mt-2">Gerencie propostas enviadas aos clientes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Proposta</span>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aceitas</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Aceito</p>
                <p className="text-2xl font-bold text-purple-600">€{stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
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
                  placeholder="Buscar propostas..."
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
                <option value="draft">Rascunhos</option>
                <option value="sent">Enviadas</option>
                <option value="accepted">Aceitas</option>
                <option value="rejected">Rejeitadas</option>
                <option value="expired">Expiradas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Válida até
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-3/4"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/3"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/3"></div></td>
                    </tr>
                  ))
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma proposta encontrada</h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== "all"
                          ? "Tente ajustar os filtros de busca"
                          : "Comece criando sua primeira proposta"
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(proposal.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {proposal.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Criada em {proposal.createdAt.toLocaleDateString('pt-PT')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {proposal.client?.name || 'Cliente não encontrado'}
                          </div>
                          {proposal.client?.company && (
                            <div className="text-sm text-gray-500">
                              {proposal.client.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        €{proposal.totalValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(proposal.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proposal.validUntil.toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingProposal(proposal)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {proposal.status === 'draft' && (
                            <button
                              onClick={() => handleSendProposal(proposal)}
                              className="text-green-600 hover:text-green-900"
                              title="Enviar por Email"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingProposal(proposal)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => proposal.id && handleDeleteProposal(proposal.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ProposalModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onSave={loadData}
        />
      )}
      
      {editingProposal && (
        <ProposalModal
          proposal={editingProposal}
          clients={clients}
          onClose={() => setEditingProposal(null)}
          onSave={loadData}
        />
      )}

      {viewingProposal && (
        <ProposalViewModal
          proposal={viewingProposal}
          client={clients.find(c => c.id === viewingProposal.clientId)}
          onClose={() => setViewingProposal(null)}
        />
      )}
    </AdminDashboardLayout>
  );
}

// Proposal Modal Component (simplified)
function ProposalModal({ 
  proposal, 
  clients,
  onClose, 
  onSave 
}: { 
  proposal?: Proposal; 
  clients: Client[];
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [formData, setFormData] = useState({
    clientId: proposal?.clientId || "",
    title: proposal?.title || "",
    description: proposal?.description || "",
    status: proposal?.status || "draft",
    validUntil: proposal?.validUntil ? proposal.validUntil.toISOString().split('T')[0] : "",
    notes: proposal?.notes || "",
    items: proposal?.items || [{ name: "", description: "", quantity: 1, price: 0 }]
  });
  const [loading, setLoading] = useState(false);

  const totalValue = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const proposalData = {
        ...formData,
        validUntil: new Date(formData.validUntil),
        totalValue,
        sentAt: formData.status === 'sent' && proposal?.status !== 'sent' ? new Date() : proposal?.sentAt
      };

      if (proposal?.id) {
        await updateProposal(proposal.id, proposalData);
      } else {
        await createProposal(proposalData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar proposta:", error);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", description: "", quantity: 1, price: 0 }]
    });
  }

  function removeItem(index: number) {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  }

  function updateItem(index: number, field: keyof typeof formData.items[0], value: any) {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {proposal ? "Editar Proposta" : "Nova Proposta"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `- ${client.company}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="draft">Rascunho</option>
                <option value="sent">Enviada</option>
                <option value="accepted">Aceita</option>
                <option value="rejected">Rejeitada</option>
                <option value="expired">Expirada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Válida até *
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Itens da Proposta</h3>
              <button
                type="button"
                onClick={addItem}
                className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Item</span>
              </button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Item *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (€)
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-lg font-semibold text-gray-900">
              Valor Total: €{totalValue.toLocaleString()}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Proposal View Modal (simplified)
function ProposalViewModal({ 
  proposal, 
  client,
  onClose 
}: { 
  proposal: Proposal; 
  client?: Client;
  onClose: () => void; 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{proposal.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cliente</h3>
              <p className="text-gray-700">{client?.name}</p>
              {client?.company && <p className="text-gray-600">{client.company}</p>}
              <p className="text-gray-600">{client?.email}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Detalhes</h3>
              <p className="text-gray-700">Status: {proposal.status}</p>
              <p className="text-gray-700">Válida até: {proposal.validUntil.toLocaleDateString('pt-PT')}</p>
              <p className="text-gray-700">Valor: €{proposal.totalValue.toLocaleString()}</p>
            </div>
          </div>
          
          {proposal.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Itens</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proposal.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-2 text-gray-700">{item.description}</td>
                      <td className="px-4 py-2 text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-2 text-gray-700">€{item.price.toLocaleString()}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">€{(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-2 font-semibold text-gray-900 text-right">Total:</td>
                    <td className="px-4 py-2 font-bold text-purple-600">€{proposal.totalValue.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {proposal.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
