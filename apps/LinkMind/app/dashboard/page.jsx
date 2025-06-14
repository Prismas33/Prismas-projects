"use client";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buscarIdeias } from "../../lib/firebase/ideias";
import { logoutUtilizador } from "../../lib/firebase/auth";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ideias, setIdeias] = useState([]);
  const [carregandoIdeias, setCarregandoIdeias] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      carregarIdeias();
    }
  }, [user]);

  async function carregarIdeias() {
    try {
      const ideiasDoUtilizador = await buscarIdeias(user.uid);
      setIdeias(ideiasDoUtilizador.slice(0, 3)); // Mostrar apenas as 3 mais recentes
    } catch (error) {
      console.error("Erro ao carregar ideias:", error);
    } finally {
      setCarregandoIdeias(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUtilizador();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7B4BFF]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2A3F9E] to-[#7B4BFF] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Olá, {user.displayName || "Utilizador"}! 👋
                </h1>
                <p className="text-gray-600">Bem-vindo ao seu espaço de ideias</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/adicionar-ideia">
            <div className="bg-gradient-to-br from-[#2E8B57] to-[#228B22] rounded-xl p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Adicionar Ideia</h2>
                  <p className="text-white/80">Capture uma nova inspiração</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/buscar-ideia">
            <div className="bg-gradient-to-br from-[#7B4BFF] to-[#6B46C1] rounded-xl p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Buscar Ideia</h2>
                  <p className="text-white/80">Encontre suas inspirações</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Ideas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Ideias Recentes</h3>
            <Link href="/buscar-ideia" className="text-[#7B4BFF] hover:underline text-sm">
              Ver todas
            </Link>
          </div>
          
          {carregandoIdeias ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B4BFF]"></div>
            </div>
          ) : ideias.length > 0 ? (
            <div className="space-y-3">
              {ideias.map((ideia) => (
                <div key={ideia.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{ideia.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">{ideia.descricao?.substring(0, 100)}...</p>
                      {ideia.categoria && (
                        <span className="inline-block bg-[#7B4BFF]/10 text-[#7B4BFF] text-xs px-2 py-1 rounded-full mt-2">
                          {ideia.categoria}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {ideia.criadaEm?.toDate?.()?.toLocaleDateString() || "Hoje"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4">Ainda não tem nenhuma ideia guardada</p>
              <Link 
                href="/adicionar-ideia"
                className="inline-flex items-center px-4 py-2 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors"
              >
                Adicionar primeira ideia
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
