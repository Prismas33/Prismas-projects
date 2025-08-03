'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/context/AdminAuthContext";
import { signOutAdmin } from "@/lib/firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Bell,
  Users,
  FileText,
  LogOut,
  Settings
} from "lucide-react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function handleLogout() {
    try {
      await signOutAdmin();
      router.push("/admin/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projetos",
      href: "/admin/projects",
      icon: FolderOpen,
    },
    {
      name: "Mensagens",
      href: "/admin/messages",
      icon: MessageSquare,
    },
    {
      name: "Notificações",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      name: "Clientes (CRM)",
      href: "/admin/clients",
      icon: Users,
    },
    {
      name: "Propostas",
      href: "/admin/proposals",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 overflow-y-auto">
        <div className="flex items-center justify-center h-16 bg-gray-800 px-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/logos/logo.png" 
              alt="Prismas33 Logo" 
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-white text-xl font-bold">Prismas33</h1>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center px-4 py-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 mt-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
