'use client';

import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { 
  getProjects, 
  getContactMessages, 
  getNotifications, 
  getClients,
  getProposals,
  Project,
  ContactMessage,
  Notification,
  Client,
  Proposal
} from "@/lib/api/admin";
import { 
  FolderOpen, 
  MessageSquare, 
  Bell, 
  Users, 
  FileText, 
  TrendingUp,
  DollarSign,
  Clock
} from "lucide-react";

interface Stats {
  totalProjects: number;
  activeProjects: number;
  pendingMessages: number;
  totalClients: number;
  activeProposals: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    pendingMessages: 0,
    totalClients: 0,
    activeProposals: 0,
    totalRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Carregar dados em paralelo
      const [projects, messages, notifications, clients, proposals] = await Promise.all([
        getProjects(),
        getContactMessages(),
        getNotifications(),
        getClients(),
        getProposals()
      ]);

      // Calcular estatísticas
      const activeProjects = projects.filter(p => p.status === 'development' || p.status === 'ready').length;
      const pendingMessages = messages.filter(m => m.status === 'pending').length;
      const activeProposals = proposals.filter(p => p.status === 'sent' || p.status === 'draft').length;
      const totalRevenue = proposals
        .filter(p => p.status === 'accepted')
        .reduce((sum, p) => sum + p.totalValue, 0);

      setStats({
        totalProjects: projects.length,
        activeProjects,
        pendingMessages,
        totalClients: clients.length,
        activeProposals,
        totalRevenue
      });

      // Atividade recente (últimos 10 itens)
      const activity = [
        ...messages.slice(0, 3).map(m => ({
          type: 'message',
          title: `Nova mensagem de ${m.name}`,
          subtitle: m.subject,
          time: m.createdAt,
          icon: MessageSquare,
          color: 'bg-blue-500'
        })),
        ...notifications.slice(0, 3).map(n => ({
          type: 'notification',
          title: `Novo interesse em ${n.appName}`,
          subtitle: n.email,
          time: n.timestamp,
          icon: Bell,
          color: 'bg-yellow-500'
        })),
        ...proposals.slice(0, 2).map(p => ({
          type: 'proposal',
          title: `Proposta ${p.status}`,
          subtitle: p.title,
          time: p.updatedAt,
          icon: FileText,
          color: 'bg-green-500'
        }))
      ].sort((a, b) => {
        const timeA = a.time instanceof Date ? a.time.getTime() : new Date(a.time).getTime();
        const timeB = b.time instanceof Date ? b.time.getTime() : new Date(b.time).getTime();
        return timeB - timeA;
      }).slice(0, 8);

      setRecentActivity(activity);
    } catch (error) {
      console.error("Erro ao carregar dados da dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total de Projetos",
      value: stats.totalProjects,
      subtitle: `${stats.activeProjects} ativos`,
      icon: FolderOpen,
      color: "bg-blue-500",
      change: "+12%"
    },
    {
      title: "Mensagens Pendentes",
      value: stats.pendingMessages,
      subtitle: "Precisam de resposta",
      icon: MessageSquare,
      color: "bg-red-500",
      change: "+3"
    },
    {
      title: "Total de Clientes",
      value: stats.totalClients,
      subtitle: "Base de clientes",
      icon: Users,
      color: "bg-green-500",
      change: "+8%"
    },
    {
      title: "Propostas Ativas",
      value: stats.activeProposals,
      subtitle: "Aguardando resposta",
      icon: FileText,
      color: "bg-purple-500",
      change: "+5"
    },
    {
      title: "Receita Total",
      value: `€${stats.totalRevenue.toLocaleString()}`,
      subtitle: "Propostas aceitas",
      icon: DollarSign,
      color: "bg-yellow-500",
      change: "+15%"
    }
  ];

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Visão geral do sistema Prismas33</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-green-600">{card.change}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Atividade Recente</h2>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${item.color} text-white`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.time.toLocaleDateString('pt-PT')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
            <div className="space-y-3">
              <a
                href="/admin/projects"
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FolderOpen className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium">Criar Novo Projeto</span>
              </a>
              <a
                href="/admin/clients"
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-medium">Adicionar Cliente</span>
              </a>
              <a
                href="/admin/proposals"
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileText className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-sm font-medium">Nova Proposta</span>
              </a>
              <a
                href="/admin/messages"
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-sm font-medium">Ver Mensagens</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
