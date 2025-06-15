"use client";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buscarIdeias } from "../../lib/firebase/ideias";
import { logoutUtilizador, obterDadosUtilizador } from "../../lib/firebase/auth";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ideias, setIdeias] = useState([]);
  const [carregandoIdeias, setCarregandoIdeias] = useState(true);
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    // Debug logs
    console.log('Dashboard - mounted:', mounted, 'loading:', loading, 'user:', !!user, 'redirecting:', redirecting);
    
    // Só redireciona se não houver usuário e o estado estiver resolvido
    if (mounted && !loading && !user && !redirecting) {
      console.log('Dashboard - Usuário não autenticado, redirecionando para login');
      setRedirecting(true);
      router.replace("/login");
    }
  }, [user, loading, router, mounted, redirecting]);

  useEffect(() => {
    if (user) {
      carregarIdeias();
      carregarPrimeiroNome();
    }
  }, [user]);
  async function carregarPrimeiroNome() {
    try {
      const nomeId = nomeParaIdFirestore(user.displayName || "");
      const dados = await obterDadosUtilizador(nomeId);
      setDadosUsuario(dados); // Adicionar estado para dados do usuário
      if (dados?.nome) {
        setPrimeiroNome(dados.nome.split(" ")[0]);
      } else if (user.displayName) {
        setPrimeiroNome(user.displayName.split(" ")[0]);
      } else {
        setPrimeiroNome("");
      }
    } catch {
      setPrimeiroNome(user.displayName ? user.displayName.split(" ")[0] : "");
    }
  }

  async function carregarIdeias() {
    try {
      const ideiasDoUtilizador = await buscarIdeias(user.displayName || "");
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

  if (!loading && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4 w-full">
            {/* Linha 1: Saudação e logo à direita */}
            <div className="w-full flex flex-row items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">
                Olá, {primeiroNome || "Utilizador"}!
              </h1>
              <img 
                src="/vector.png" 
                alt="LinkMind" 
                className="w-16 h-16 object-contain" // maior
                title="LinkMind"
              />
            </div>
            {/* Linha 2: Foto de perfil à esquerda, botões à direita */}
            <div className="w-full flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#7B4BFF]/20 shadow-lg">
                    {dadosUsuario?.fotoPerfil ? (
                      <img 
                        src={dadosUsuario.fotoPerfil} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2A3F9E] to-[#7B4BFF] flex items-center justify-center text-white text-2xl font-bold">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/settings">
                  <button className="relative group text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 text-2xl" title="Definições">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-1.14 1.952-1.14 2.252 0a1.724 1.724 0 002.573 1.01c.943-.545 2.042.454 1.497 1.397a1.724 1.724 0 001.01 2.573c1.14.3 1.14 1.952 0 2.252a1.724 1.724 0 00-1.01 2.573c.545.943-.454 2.042-1.397 1.497a1.724 1.724 0 00-2.573 1.01c-.3 1.14-1.952 1.14-2.252 0a1.724 1.724 0 00-2.573-1.01c-.943.545-2.042-.454-1.497-1.397a1.724 1.724 0 00-1.01-2.573c-1.14-.3-1.14-1.952 0-2.252a1.724 1.724 0 001.01-2.573c-.545-.943.454-2.042 1.397-1.497.943.545 2.042-.454 1.497-1.397z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Definições
                    </span>
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="relative group text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 text-2xl"
                  title="Terminar sessão"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Terminar sessão
                  </span>
                </button>
              </div>
            </div>
            {/* Linha 3: Mensagem de boas-vindas e data */}
            <div className="w-full flex flex-row items-center gap-2 justify-start">
              <span className="text-xl">👋</span>
              <span className="text-gray-700 font-medium">Bem-vindo ao teu espaço mental digital</span>
              <span className="text-sm text-gray-500 ml-2">
                {new Date().toLocaleDateString('pt-PT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/adicionar-ideia" className="w-full group">
            <div className="bg-gradient-to-br from-[#7B4BFF] to-[#FFD700] rounded-xl p-4 text-white hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer w-full group-hover:from-[#6A3FEF] group-hover:to-[#FFC700]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Upload</h2>
                  <p className="text-white/80 text-sm">Adiciona novos ficheiros à tua mente virtual</p>
                  <p className="text-xs text-white/60 mt-1">💡 Capta o que pensas</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/buscar-ideia" className="w-full group">
            <div className="bg-gradient-to-br from-[#2A3F9E] to-[#7B4BFF] rounded-xl p-4 text-white hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer w-full group-hover:from-[#1F2F7E] group-hover:to-[#6A3FEF]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Download</h2>
                  <p className="text-white/80 text-sm">Vasculha no interior da tua mente</p>
                  <p className="text-xs text-white/60 mt-1">🔍 Descobre e relembra</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
        {/* Stats rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow" title="Total de ficheiros guardados hoje">
            <div className="text-2xl font-bold text-[#7B4BFF]">{ideias.length}</div>
            <div className="text-sm text-gray-600">Ficheiros de hoje</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow" title="Ligado à internet">
            <div className="text-2xl font-bold text-green-500">✓</div>
            <div className="text-sm text-gray-600">Online</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow" title="Sessão ativa no sistema">
            <div className="text-2xl font-bold text-orange-500">⚡</div>
            <div className="text-sm text-gray-600">Ativo</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow" title="Dados sincronizados na nuvem">
            <div className="text-2xl font-bold text-blue-500">💾</div>
            <div className="text-sm text-gray-600">Sincronizado</div>
          </div>
        </div>
        {/* O que vai na tua mente - Últimos 10 tópicos */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <span>🧠</span>
              <span>O que vai na tua mente</span>
            </h3>
            {ideias.length > 3 && (
              <Link href="/buscar-ideia" className="text-[#7B4BFF] hover:text-[#6A3FEF] text-sm font-medium transition-colors">
                Ver todas →
              </Link>
            )}
          </div>
          {carregandoIdeias ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B4BFF]"></div>
            </div>
          ) : ideias.length > 0 ? (
            <div className="space-y-3">
              {ideias.slice(0, 10).map((ideia, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-[#7B4BFF]/30 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-800 group-hover:text-[#7B4BFF] transition-colors">
                          {ideia.quem || ideia.titulo || "Ideia sem título"}
                        </h4>
                        {ideia.fileUrl && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">📎</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ideia.oque?.substring(0, 100) || ideia.descricao?.substring(0, 100) || "Sem descrição"}
                        {(ideia.oque?.length > 100 || ideia.descricao?.length > 100) && "..."}
                      </p>
                      {ideia.categoria && (
                        <span className="inline-block bg-[#7B4BFF]/10 text-[#7B4BFF] text-xs px-2 py-1 rounded-full mt-2">
                          {ideia.categoria}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 ml-4 text-right">
                      <div>{ideia.criadaEm?.toDate?.()?.toLocaleDateString('pt-PT') || "Hoje"}</div>
                      <div className="mt-1 opacity-60">
                        {ideia.criadaEm?.toDate?.()?.toLocaleTimeString('pt-PT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) || new Date().toLocaleTimeString('pt-PT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">Pronto para a tua primeira ideia?</h4>
              <p className="text-gray-500 mb-6">Capta os teus pensamentos e organiza-os de forma inteligente</p>
              <Link href="/adicionar-ideia">
                <button className="bg-[#7B4BFF] text-white px-6 py-3 rounded-lg hover:bg-[#6A3FEF] transition-colors font-medium">
                  Adicionar primeira ideia 🚀
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
