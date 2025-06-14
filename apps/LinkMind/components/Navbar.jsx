"use client";
import Link from "next/link";
import { useAuth } from "../lib/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Não mostrar navbar nas páginas de auth
  if (pathname === "/login" || pathname === "/registo") {
    return null;
  }

  // Não mostrar navbar se não estiver logado
  if (!user) {
    return null;
  }

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-[#2A3F9E] to-[#7B4BFF] shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="LinkMind" className="w-8 h-8" />
            <span className="font-bold text-xl text-white">LinkMind</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`text-white hover:text-[#FFD700] transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/dashboard") ? "bg-white/10" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/adicionar-ideia" 
              className={`text-white hover:text-[#FFD700] transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/adicionar-ideia") ? "bg-white/10" : ""
              }`}
            >
              Adicionar Ideia
            </Link>
            <Link 
              href="/buscar-ideia" 
              className={`text-white hover:text-[#FFD700] transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/buscar-ideia") ? "bg-white/10" : ""
              }`}
            >
              Buscar Ideia
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="hidden sm:block text-white text-sm">
              {user.displayName || "Utilizador"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white/10">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link 
            href="/dashboard" 
            className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#FFD700] hover:bg-white/10 transition-colors ${
              isActive("/dashboard") ? "bg-white/20" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/adicionar-ideia" 
            className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#FFD700] hover:bg-white/10 transition-colors ${
              isActive("/adicionar-ideia") ? "bg-white/20" : ""
            }`}
          >
            Adicionar Ideia
          </Link>
          <Link 
            href="/buscar-ideia" 
            className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#FFD700] hover:bg-white/10 transition-colors ${
              isActive("/buscar-ideia") ? "bg-white/20" : ""
            }`}
          >
            Buscar Ideia
          </Link>
        </div>
      </div>
    </nav>
  );
}
