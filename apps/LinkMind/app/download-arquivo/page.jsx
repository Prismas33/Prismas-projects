"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { downloadArquivos, obterSugestoes } from "../../lib/firebase/arquivos";
import CardArquivo from "../../components/CardArquivo";
import Link from "next/link";

export default function DownloadArquivoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [buscaDataInicio, setBuscaDataInicio] = useState("");
  const [buscaDataFim, setBuscaDataFim] = useState("");
  const [tipoData, setTipoData] = useState("fim"); // "criacao", "inicio" ou "fim"
  const [modalArquivo, setModalArquivo] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    // Não carrega arquivos automaticamente
  }, [user, loading, router]);
  useEffect(() => {
    if (user) {
      //carregarTodosArquivos();
    }
  }, [user]);

  useEffect(() => {
    // Busca em tempo real com debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (busca.trim()) {
        realizarBusca();
        obterSugestoesAutocomplete();
      } else {
        //carregarTodosArquivos();
        setSugestoes([]);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [busca, filtroCategoria, filtroPrioridade]);
  async function carregarTodosArquivos() {
    if (!user) return;
    
    setCarregando(true);
    try {
      const arquivos = await downloadArquivos(user.displayName || "");
      let arquivosFiltrados = arquivos;

      // Aplicar filtros
      if (filtroCategoria) {
        arquivosFiltrados = arquivosFiltrados.filter(arquivo => arquivo.categoria === filtroCategoria);
      }
      if (filtroPrioridade) {
        arquivosFiltrados = arquivosFiltrados.filter(arquivo => arquivo.prioridade === filtroPrioridade);
      }

      setResultados(arquivosFiltrados);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    } finally {
      setCarregando(false);
    }
  }
  async function realizarBusca() {
    if (!user) return;
    
    setCarregando(true);
    try {
      const arquivos = await downloadArquivos(user.displayName || "", busca);
      let arquivosFiltrados = arquivos;

      // Aplicar filtros
      if (filtroCategoria) {
        arquivosFiltrados = arquivosFiltrados.filter(arquivo => arquivo.categoria === filtroCategoria);
      }
      if (filtroPrioridade) {
        arquivosFiltrados = arquivosFiltrados.filter(arquivo => arquivo.prioridade === filtroPrioridade);
      }

      setResultados(arquivosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function obterSugestoesAutocomplete() {
    try {
      const sugestoesObtidas = await obterSugestoes(busca);
      setSugestoes(sugestoesObtidas);
    } catch (error) {
      console.error("Erro ao obter sugestões:", error);
    }
  }

  function selecionarSugestao(sugestao) {
    setBusca(sugestao);
    setMostrarSugestoes(false);
  }

  // Busca por intervalo de datas e tipo
  async function buscarPorIntervaloDatas() {
    if (!user || !buscaDataInicio || !buscaDataFim) return;
    setCarregando(true);
    try {
      const arquivos = await downloadArquivos(user.displayName || "");
      const inicio = new Date(buscaDataInicio);
      inicio.setHours(0,0,0,0);
      const fim = new Date(buscaDataFim);
      fim.setHours(23,59,59,999);
      const arquivosFiltrados = arquivos.filter(arquivo => {
        let data;
        if (tipoData === "fim") {
          if (!arquivo.dataFim) return false;
          data = arquivo.dataFim.toDate ? arquivo.dataFim.toDate() : new Date(arquivo.dataFim);
        } else if (tipoData === "inicio") {
          if (!arquivo.dataInicio) return false;
          data = arquivo.dataInicio.toDate ? arquivo.dataInicio.toDate() : new Date(arquivo.dataInicio);
        } else {
          data = (arquivo.criadoEm || arquivo.criadaEm)?.toDate?.() || new Date(arquivo.criadoEm || arquivo.criadaEm || 0);
        }
        return data >= inicio && data <= fim;
      });
      setResultados(arquivosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar por intervalo de datas:", error);
    } finally {
      setCarregando(false);
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
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-[#7B4BFF] hover:text-[#6B46C1]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>              <h1 className="text-2xl font-bold text-gray-800">📥 Download de Arquivos</h1>
              <p className="text-gray-600">Encontre e baixe os seus arquivos mentais guardados</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {/* Busca avançada moderna */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col gap-6">
          {/* Busca por nome */}
          <div>
            <label htmlFor="busca-nome" className="block text-sm font-medium text-gray-700 mb-1">Buscar por nome do arquivo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="busca-nome"
                type="text"
                placeholder="Digite para buscar..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                onFocus={() => setMostrarSugestoes(true)}
                onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-black bg-gray-50"
                style={{ color: '#111' }}
                autoComplete="off"
              />
              {/* Autocomplete Dropdown */}
              {mostrarSugestoes && sugestoes.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {sugestoes.map((sugestao, index) => (
                    <button
                      key={index}
                      onClick={() => selecionarSugestao(sugestao)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-black"
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Divisor visual */}
          <div className="border-t border-gray-100 my-2"></div>
          {/* Busca por datas */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label htmlFor="data-inicio" className="block text-sm font-medium text-gray-700 mb-1">Data de início</label>
                <input
                  id="data-inicio"
                  type="date"
                  value={buscaDataInicio}
                  onChange={e => setBuscaDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent text-black bg-gray-50"
                  style={{ color: '#111' }}
                  placeholder="Data início"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="data-fim" className="block text-sm font-medium text-gray-700 mb-1">Data de fim</label>
                <input
                  id="data-fim"
                  type="date"
                  value={buscaDataFim}
                  onChange={e => setBuscaDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent text-black bg-gray-50"
                  style={{ color: '#111' }}
                  placeholder="Data fim"
                />
              </div>
              <div className="flex flex-col gap-2 md:ml-4">
                <span className="block text-xs text-gray-500 mb-1">Tipo de data</span>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipoData === "criacao"}
                      onChange={() => setTipoData("criacao")}
                      className="accent-[#7B4BFF]"
                    />
                    Criação
                  </label>
                  <label className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipoData === "inicio"}
                      onChange={() => setTipoData("inicio")}
                      className="accent-[#7B4BFF]"
                    />
                    Início
                  </label>
                  <label className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipoData === "fim"}
                      onChange={() => setTipoData("fim")}
                      className="accent-[#7B4BFF]"
                    />
                    Fim
                  </label>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={buscarPorIntervaloDatas}
                  className="px-6 py-3 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors font-semibold shadow-md"
                >
                  Procurar
                </button>
              </div>
            </div>
            <span className="block text-xs text-gray-400 mt-2">Pesquise arquivos entre datas de criação, início ou fim.</span>
          </div>
        </div>

        {/* Resultados */}
        {(busca || (buscaDataInicio && buscaDataFim)) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {busca ? `Resultados para "${busca}"` : `Arquivos entre ${buscaDataInicio.split('-').reverse().join('/')} e ${buscaDataFim.split('-').reverse().join('/')}`}
                <span className="text-sm text-gray-500 ml-2">
                  ({resultados.length} {resultados.length === 1 ? "arquivo" : "arquivos"})
                </span>
              </h3>
            </div>
            {carregando ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B4BFF]"></div>
              </div>
            ) : resultados.length > 0 ? (
              <div className="space-y-2">
                {resultados.map((arquivo, idx) => (
                  <div
                    key={arquivo.id || idx}
                    className="flex justify-between items-center border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => { setArquivoSelecionado(arquivo); setModalArquivo(true); }}
                  >
                    <span className="font-medium text-black">{arquivo.nome || arquivo.quem || arquivo.titulo || "Arquivo sem título"}</span>
                    <span className="text-xs text-black ml-4">{(arquivo.criadoEm || arquivo.criadaEm)?.toDate?.()?.toLocaleDateString('pt-PT') || "---"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-500 mb-4">Tente outro nome ou intervalo de datas.</p>
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
        )}
      </div>
    </div>
  );
}
