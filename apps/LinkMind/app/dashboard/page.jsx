"use client";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { downloadArquivos } from "../../lib/firebase/arquivos";
import { logoutUtilizador, obterDadosUtilizador } from "../../lib/firebase/auth";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();  const [arquivos, setArquivos] = useState([]);
  const [carregandoArquivos, setCarregandoArquivos] = useState(true);
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);  const [arquivosSemanaAtual, setArquivosSemanaAtual] = useState(0);
  const [arquivosHoje, setArquivosHoje] = useState(0);
  // Estados para modais e listas
  const [modalSemanaAberto, setModalSemanaAberto] = useState(false);
  const [modalHojeAberto, setModalHojeAberto] = useState(false);
  const [arquivosVencemSemana, setArquivosVencemSemana] = useState([]);
  const [arquivosVencemHoje, setArquivosVencemHoje] = useState([]);
  const [modalArquivo, setModalArquivo] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);  useEffect(() => {
    // Só redireciona se não houver usuário e o estado estiver resolvido
    if (mounted && !loading && !user && !redirecting) {
      console.log('Dashboard - Usuário não autenticado, redirecionando para login');
      setRedirecting(true);
      router.push("/login");
    }
  }, [user, loading, mounted, redirecting]); // Removido router das dependências
  useEffect(() => {
    if (user) {
      carregarArquivos();
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
  }  async function carregarArquivos() {
    try {
      const arquivosDoUtilizador = await downloadArquivos(user.displayName || "");
      setArquivos(arquivosDoUtilizador.slice(0, 3)); // Mostrar apenas os 3 mais recentes

      // Calcular semana
      const agora = new Date();
      const inicioSemana = new Date(agora);
      inicioSemana.setDate(agora.getDate() - agora.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      fimSemana.setHours(23, 59, 59, 999);
      const arquivosComDataFimEstaSemana = arquivosDoUtilizador.filter(arquivo => {
        if (!arquivo.dataFim) return false;
        let dataFim;
        if (arquivo.dataFim.toDate) {
          dataFim = arquivo.dataFim.toDate();
        } else if (typeof arquivo.dataFim === 'string') {
          dataFim = new Date(arquivo.dataFim);
        } else {
          dataFim = new Date(arquivo.dataFim);
        }
        return dataFim >= inicioSemana && dataFim <= fimSemana;
      });
      const arquivosSemanaOrdenados = [...arquivosComDataFimEstaSemana].sort((a, b) => {
        const dataA = a.dataFim?.toDate ? a.dataFim.toDate() : new Date(a.dataFim);
        const dataB = b.dataFim?.toDate ? b.dataFim.toDate() : new Date(b.dataFim);
        return dataB - dataA;
      });
      setArquivosVencemSemana(arquivosSemanaOrdenados);
      setArquivosSemanaAtual(arquivosComDataFimEstaSemana.length);

      // Calcular hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const fimHoje = new Date(hoje);
      fimHoje.setHours(23, 59, 59, 999);
      const arquivosComDataFimHoje = arquivosDoUtilizador.filter(arquivo => {
        if (!arquivo.dataFim) return false;
        let dataFim;
        if (arquivo.dataFim.toDate) {
          dataFim = arquivo.dataFim.toDate();
        } else if (typeof arquivo.dataFim === 'string') {
          dataFim = new Date(arquivo.dataFim);
        } else {
          dataFim = new Date(arquivo.dataFim);
        }
        return dataFim >= hoje && dataFim <= fimHoje;
      });
      const arquivosHojeOrdenados = [...arquivosComDataFimHoje].sort((a, b) => {
        const dataA = a.dataFim?.toDate ? a.dataFim.toDate() : new Date(a.dataFim);
        const dataB = b.dataFim?.toDate ? b.dataFim.toDate() : new Date(b.dataFim);
        return dataB - dataA;
      });
      setArquivosVencemHoje(arquivosHojeOrdenados);
      setArquivosHoje(arquivosComDataFimHoje.length);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    } finally {
      setCarregandoArquivos(false);
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
          <Link href="/upload-arquivo" className="w-full group">
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
          <Link href="/download-arquivo" className="w-full group">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">          <div className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow" title="Total de ficheiros enviados hoje">            <div className="text-2xl font-bold text-[#7B4BFF]">{arquivosHoje}</div>
            <div className="text-sm text-gray-600">Uploads de hoje</div>
          </div>          <div 
            className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
            title="Arquivos com data de fim esta semana"
            onClick={() => setModalSemanaAberto(true)}
          >
            <div className="text-2xl font-bold text-green-500">{arquivosSemanaAtual}</div>
            <div className="text-sm text-gray-600">A vencer esta semana</div>
          </div>          <div 
            className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
            title="Arquivos com data de fim hoje"
            onClick={() => setModalHojeAberto(true)}
          >
            <div className="text-2xl font-bold text-orange-500">{arquivosHoje}</div>
            <div className="text-sm text-gray-600">A vencer hoje</div>
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
            {arquivos.length > 3 && (
              <Link href="/download-arquivo" className="text-[#7B4BFF] hover:text-[#6A3FEF] text-sm font-medium transition-colors">
                Ver todos →
              </Link>
            )}
          </div>
          {carregandoArquivos ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B4BFF]"></div>
            </div>
          ) : arquivos.length > 0 ? (
            <div className="space-y-3">
              {arquivos.slice(0, 10).map((arquivo, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-[#7B4BFF]/30 transition-all cursor-pointer group flex items-center justify-between"
                  onClick={() => { setArquivoSelecionado(arquivo); setModalArquivo(true); }}
                >
                  <div className="font-medium text-gray-800 group-hover:text-[#7B4BFF] transition-colors">
                    {arquivo.nome || arquivo.quem || arquivo.titulo || "Arquivo sem título"}
                  </div>
                  <div className="text-xs text-gray-400 ml-4 text-right">
                    {(arquivo.criadoEm || arquivo.criadaEm)?.toDate?.()?.toLocaleDateString('pt-PT') || "Hoje"}
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
              <h4 className="text-lg font-medium text-gray-600 mb-2">Pronto para o seu primeiro arquivo?</h4>
              <p className="text-gray-500 mb-6">Envie os seus pensamentos e organize-os de forma inteligente</p>
              <Link href="/upload-arquivo">
                <button className="bg-[#7B4BFF] text-white px-6 py-3 rounded-lg hover:bg-[#6A3FEF] transition-colors font-medium">
                  📁 Enviar primeiro arquivo
                </button>
              </Link>
            </div>
          )}
          {/* Modal de detalhes do arquivo */}
          {modalArquivo && arquivoSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setModalArquivo(false)}
                >
                  &times;
                </button>
                <h2 className="text-xl font-bold mb-2 text-[#7B4BFF]">
                  {arquivoSelecionado.nome || arquivoSelecionado.quem || arquivoSelecionado.titulo || "Arquivo sem título"}
                </h2>
                <div className="mb-2 text-sm text-gray-500">
                  Data de criação: {(arquivoSelecionado.criadoEm || arquivoSelecionado.criadaEm)?.toDate?.()?.toLocaleDateString('pt-PT')}<br/>
                  Data de fim: {arquivoSelecionado.dataFim?.toDate?.()?.toLocaleDateString('pt-PT') || (arquivoSelecionado.dataFim ? new Date(arquivoSelecionado.dataFim).toLocaleDateString('pt-PT') : '---')}
                </div>
                {arquivoSelecionado.categoria && (
                  <div className="mb-2 text-xs inline-block bg-[#7B4BFF]/10 text-[#7B4BFF] px-2 py-1 rounded-full">
                    {arquivoSelecionado.categoria}
                  </div>
                )}
                <div className="mt-4 text-gray-700 whitespace-pre-line">
                  {arquivoSelecionado.conteudo || arquivoSelecionado.oque || arquivoSelecionado.descricao || "Sem descrição"}
                </div>
                {arquivoSelecionado.fileUrl && (
                  <div className="mt-4">
                    <a href={arquivoSelecionado.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Abrir anexo</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal - Arquivos a vencer esta semana */}
        {modalSemanaAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">📅 Arquivos a vencer esta semana</h2>
                <button 
                  onClick={() => setModalSemanaAberto(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              {arquivosVencemSemana.length > 0 ? (
                <div className="space-y-3">
                  {arquivosVencemSemana.map((arquivo, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-800">
                              {arquivo.nome || arquivo.quem || arquivo.titulo || "Arquivo sem título"}
                            </h4>
                            {arquivo.fileUrl && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">📎</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {arquivo.conteudo?.substring(0, 150) || arquivo.oque?.substring(0, 150) || arquivo.descricao?.substring(0, 150) || "Sem descrição"}
                            {(arquivo.conteudo?.length > 150 || arquivo.oque?.length > 150 || arquivo.descricao?.length > 150) && "..."}
                          </p>
                          {arquivo.categoria && (
                            <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full mt-2">
                              {arquivo.categoria}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 ml-4 text-right">
                          <div className="font-medium text-green-600">
                            Vence: {arquivo.dataFim?.toDate?.()?.toLocaleDateString('pt-PT') || new Date(arquivo.dataFim).toLocaleDateString('pt-PT')}
                          </div>
                          <div className="mt-1 opacity-60">
                            Criado: {(arquivo.criadoEm || arquivo.criadaEm)?.toDate?.()?.toLocaleDateString('pt-PT') || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📅</div>
                  <p className="text-gray-600">Nenhum arquivo vence esta semana</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal - Arquivos a vencer hoje */}
        {modalHojeAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">⚡ Arquivos a vencer hoje</h2>
                <button 
                  onClick={() => setModalHojeAberto(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              {arquivosVencemHoje.length > 0 ? (
                <div className="space-y-3">
                  {arquivosVencemHoje.map((arquivo, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-800">
                              {arquivo.nome || arquivo.quem || arquivo.titulo || "Arquivo sem título"}
                            </h4>
                            {arquivo.fileUrl && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">📎</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {arquivo.conteudo?.substring(0, 150) || arquivo.oque?.substring(0, 150) || arquivo.descricao?.substring(0, 150) || "Sem descrição"}
                            {(arquivo.conteudo?.length > 150 || arquivo.oque?.length > 150 || arquivo.descricao?.length > 150) && "..."}
                          </p>
                          {arquivo.categoria && (
                            <span className="inline-block bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full mt-2">
                              {arquivo.categoria}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 ml-4 text-right">
                          <div className="font-medium text-orange-600">
                            Vence: Hoje
                          </div>
                          <div className="mt-1 opacity-60">
                            Criado: {(arquivo.criadoEm || arquivo.criadaEm)?.toDate?.()?.toLocaleDateString('pt-PT') || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">⚡</div>
                  <p className="text-gray-600">Nenhum arquivo vence hoje</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
