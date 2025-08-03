'use client';

import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { 
  getNotifications, 
  updateNotificationStatus,
  type Notification 
} from "@/lib/api/admin";
import { 
  Bell, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Download,
  Filter
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === "" || (
      (notification.title && notification.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notification.message && notification.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notification.type && notification.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "read" && notification.read) ||
      (statusFilter === "unread" && !notification.read);
    
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Estatísticas
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    read: notifications.filter(n => n.read).length,
    project_messages: notifications.filter(n => n.type === 'new_project_message').length,
  };

  // Tipos únicos para filtro
  const uniqueTypes = Array.from(new Set(notifications.map(n => n.type)));

  async function handleMarkAsRead(id: string) {
    try {
      await updateNotificationStatus(id, true);
      await loadNotifications();
    } catch (error: any) {
      console.error('Erro ao marcar como lida:', error);
      alert(`Erro ao marcar como lida: ${error.message}`);
    }
  }

  async function handleMarkAsUnread(id: string) {
    try {
      await updateNotificationStatus(id, false);
      await loadNotifications();
    } catch (error: any) {
      console.error('Erro ao marcar como não lida:', error);
      alert(`Erro ao marcar como não lida: ${error.message}`);
    }
  }

  function exportToCSV() {
    const headers = 'ID,Tipo,Título,Mensagem,Data,Status\n';
    const rows = notifications.map(notif => 
      `"${notif.id}","${notif.type}","${notif.title}","${notif.message}","${new Date(notif.timestamp).toLocaleString('pt-PT')}","${notif.read ? 'Lida' : 'Não lida'}"`
    ).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notificacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getTypeBadge = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'new_project_message': 'Mensagem de Projeto',
      'contact_form': 'Formulário de Contato',
      'newsletter_signup': 'Newsletter',
      'app_interest': 'Interesse em App'
    };

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {typeLabels[type] || type}
      </span>
    );
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            Notificações
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie todas as notificações do sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Não Lidas</dt>
                    <dd className="text-lg font-medium text-red-600">{stats.unread}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Lidas</dt>
                    <dd className="text-lg font-medium text-green-600">{stats.read}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Mensagens de Projeto</dt>
                    <dd className="text-lg font-medium text-blue-600">{stats.project_messages}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar notificações..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="unread">Não Lidas</option>
                  <option value="read">Lidas</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="sm:w-48">
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Todos os Tipos</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'new_project_message' ? 'Mensagem de Projeto' : type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button>
            </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              Notificações ({filteredNotifications.length})
            </h2>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeBadge(notification.type)}
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Nova
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {notification.read ? (
                          <button
                            onClick={() => handleMarkAsUnread(notification.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Marcar como não lida
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
