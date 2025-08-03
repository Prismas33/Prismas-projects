'use client';

import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { 
  getNotifications, 
  updateNotificationStatus,
  Notification 
} from "@/lib/firebase/firestore";
import { sendFollowUpEmail } from "@/lib/services/email";
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
  const [appFilter, setAppFilter] = useState<string>("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const notificationsData = await getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.appName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    const matchesApp = appFilter === "all" || notification.appName === appFilter;
    
    return matchesSearch && matchesStatus && matchesApp;
  });

  // Estatísticas
  const stats = {
    total: notifications.length,
    pending: notifications.filter(n => n.status === 'pending').length,
    contacted: notifications.filter(n => n.status === 'contacted').length,
    converted: notifications.filter(n => n.status === 'converted').length,
    ignored: notifications.filter(n => n.status === 'ignored').length
  };

  // Apps únicos para filtro
  const uniqueApps = Array.from(new Set(notifications.map(n => n.appName)));

  async function handleStatusUpdate(notificationId: string, newStatus: Notification['status']) {
    try {
      await updateNotificationStatus(notificationId, newStatus);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? {...notif, status: newStatus} : notif
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  }

  async function handleSendFollowUp(notification: Notification) {
    try {
      const emailSent = await sendFollowUpEmail({
        to_email: notification.email,
        app_name: notification.appName,
        custom_message: `Obrigado pelo seu interesse na aplicação ${notification.appName}! Gostaríamos de saber mais sobre as suas necessidades e como podemos ajudar.`
      });

      if (emailSent) {
        // Atualizar status para "contacted"
        await handleStatusUpdate(notification.id!, 'contacted');
        alert("✅ Email de follow-up enviado com sucesso!");
      } else {
        alert("❌ Erro ao enviar follow-up. Verifique as configurações do EmailJS.");
      }
    } catch (error) {
      console.error("Erro ao enviar follow-up:", error);
      alert("❌ Erro ao enviar follow-up. Tente novamente.");
    }
  }

  function exportToCSV() {
    const csvHeader = "Email,App,Data,Status,User Agent,Idioma,Referrer\n";
    const csvData = filteredNotifications.map(notif => 
      `"${notif.email}","${notif.appName}","${notif.timestamp.toLocaleString('pt-PT')}","${notif.status}","${notif.userAgent || ''}","${notif.language || ''}","${notif.referrer || ''}"`
    ).join("\n");
    
    const csvContent = csvHeader + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `notificacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      contacted: "bg-blue-100 text-blue-800",
      converted: "bg-green-100 text-green-800",
      ignored: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      pending: "Pendente",
      contacted: "Contactado",
      converted: "Convertido",
      ignored: "Ignorado"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  }

  function getAppBadge(appName: string) {
    const colors = [
      "bg-purple-100 text-purple-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-pink-100 text-pink-800"
    ];
    
    const index = uniqueApps.indexOf(appName) % colors.length;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[index]}`}>
        {appName}
      </span>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
            <p className="text-gray-600 mt-2">Emails coletados dos formulários de interesse</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
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
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contactados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Convertidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ignorados</p>
                <p className="text-2xl font-bold text-gray-600">{stats.ignored}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por email ou app..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="contacted">Contactado</option>
                <option value="converted">Convertido</option>
                <option value="ignored">Ignorado</option>
              </select>
            </div>
            <div className="lg:w-48">
              <select
                value={appFilter}
                onChange={(e) => setAppFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todas as Apps</option>
                {uniqueApps.map(app => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    App
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/3"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-1/2"></div></td>
                    </tr>
                  ))
                ) : filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação encontrada</h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== "all" || appFilter !== "all"
                          ? "Tente ajustar os filtros de busca"
                          : "As notificações aparecerão aqui quando os visitantes demonstrarem interesse"
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {notification.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAppBadge(notification.appName)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.timestamp.toLocaleString('pt-PT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(notification.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {notification.status === 'pending' && (
                            <button
                              onClick={() => handleSendFollowUp(notification)}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                              title="Enviar Follow-up"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          )}
                          <select
                            value={notification.status}
                            onChange={(e) => handleStatusUpdate(notification.id!, e.target.value as Notification['status'])}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="pending">Pendente</option>
                            <option value="contacted">Contactado</option>
                            <option value="converted">Convertido</option>
                            <option value="ignored">Ignorado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination could be added here */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Mostrando {filteredNotifications.length} de {notifications.length} notificações
            </p>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
