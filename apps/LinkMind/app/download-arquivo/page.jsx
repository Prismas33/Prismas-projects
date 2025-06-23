"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { downloadArquivos, obterSugestoes, removerArquivo, editarArquivo } from "../../lib/firebase/arquivos";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import CardArquivo from "../../components/CardArquivo";
import PremiumGuard from "../../components/PremiumGuard";
import Link from "next/link";
import { useI18n } from "../../lib/context/I18nContext";

export default function DownloadArquivoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [buscaDataInicio, setBuscaDataInicio] = useState("");
  const [buscaDataFim, setBuscaDataFim] = useState("");  const [tipoData, setTipoData] = useState("fim"); // "criacao", "inicio" ou "fim"
  const [modalArquivo, setModalArquivo] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [arquivoEditando, setArquivoEditando] = useState(null);
  const [removendo, setRemovendo] = useState(false);
  const [editando, setEditando] = useState(false);
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
  }  // Função para abrir modal de edição
  function abrirModalEdicao() {
    setArquivoEditando({
      originalIndex: arquivoSelecionado.originalIndex,
      nome: arquivoSelecionado.nome || '',
      subNome: arquivoSelecionado.subNome || '',
      conteudo: arquivoSelecionado.conteudo || arquivoSelecionado.oque || arquivoSelecionado.descricao || '',
      prioridade: arquivoSelecionado.prioridade || 'media',
      dataInicio: arquivoSelecionado.dataInicio ? 
        (arquivoSelecionado.dataInicio.toDate ? 
          arquivoSelecionado.dataInicio.toDate().toISOString().split('T')[0] : 
          new Date(arquivoSelecionado.dataInicio).toISOString().split('T')[0]) : '',
      dataFim: arquivoSelecionado.dataFim ? 
        (arquivoSelecionado.dataFim.toDate ? 
          arquivoSelecionado.dataFim.toDate().toISOString().split('T')[0] : 
          new Date(arquivoSelecionado.dataFim).toISOString().split('T')[0]) : ''
    });
    setModalEdicao(true);
  }

  // Função para salvar edição
  async function salvarEdicao() {
    if (!arquivoEditando || !user) return;
    
    setEditando(true);
    try {
      const userNomeId = nomeParaIdFirestore(user.displayName || "");
      const dadosAtualizados = {
        nome: arquivoEditando.nome,
        subNome: arquivoEditando.subNome,
        conteudo: arquivoEditando.conteudo,
        prioridade: arquivoEditando.prioridade,
        dataInicio: arquivoEditando.dataInicio || null,
        dataFim: arquivoEditando.dataFim || null
      };await editarArquivo(userNomeId, arquivoEditando.originalIndex, dadosAtualizados);
      
      // Atualizar arquivo selecionado
      setArquivoSelecionado(prev => ({...prev, ...dadosAtualizados}));
      
      // Atualizar lista de resultados
      setResultados(prev => prev.map(arquivo => 
        arquivo.originalIndex === arquivoEditando.originalIndex ? {...arquivo, ...dadosAtualizados} : arquivo
      ));
      
      setModalEdicao(false);
      setArquivoEditando(null);
    } catch (error) {
      console.error("Erro ao editar arquivo:", error);
      alert("Erro ao editar arquivo. Tente novamente.");
    } finally {
      setEditando(false);
    }
  }

  // Função para confirmar remoção
  async function confirmarRemocao() {
    if (!arquivoSelecionado || !user) return;
    
    setRemovendo(true);
    try {
      const userNomeId = nomeParaIdFirestore(user.displayName || "");      await removerArquivo(userNomeId, arquivoSelecionado.originalIndex);
      
      // Remover da lista de resultados
      setResultados(prev => prev.filter(arquivo => arquivo.originalIndex !== arquivoSelecionado.originalIndex));
      
      // Fechar modais
      setModalConfirmacao(false);
      setModalArquivo(false);
      setArquivoSelecionado(null);
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
      alert("Erro ao remover arquivo. Tente novamente.");
    } finally {
      setRemovendo(false);
    }
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
    <PremiumGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-[#7B4BFF] hover:text-[#6B46C1]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>            <div>              <h1 className="text-2xl font-bold text-gray-800">📥 {t('download_file.title')}</h1>
              <p className="text-gray-600">{t('download_file.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {/* Busca avançada moderna */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col gap-6">          {/* Busca por nome */}
          <div>
            <label htmlFor="busca-nome" className="block text-sm font-medium text-gray-700 mb-1">{t('download_file.search_by_name')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="busca-nome"
                type="text"
                placeholder={t('download_file.search_placeholder')}
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
          <div>            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label htmlFor="data-inicio" className="block text-sm font-medium text-gray-700 mb-1">{t('download_file.start_date')}</label>
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
                <label htmlFor="data-fim" className="block text-sm font-medium text-gray-700 mb-1">{t('download_file.end_date')}</label>
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
                <span className="block text-xs text-gray-500 mb-1">{t('download_file.date_type')}</span>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipoData === "criacao"}
                      onChange={() => setTipoData("criacao")}
                      className="accent-[#7B4BFF]"
                    />
                    {t('download_file.creation')}
                  </label>
                  <label className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipoData === "inicio"}
                      onChange={() => setTipoData("inicio")}
                      className="accent-[#7B4BFF]"
                    />
                    {t('download_file.start')}
                  </label>
                  <label className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={tipoData === "fim"}
                      onChange={() => setTipoData("fim")}
                      className="accent-[#7B4BFF]"
                    />
                    {t('download_file.end')}
                  </label>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={buscarPorIntervaloDatas}
                  className="px-6 py-3 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors font-semibold shadow-md"
                >
                  {t('download_file.search_button')}
                </button>
              </div>
            </div>
            <span className="block text-xs text-gray-400 mt-2">{t('download_file.search_help')}</span>
          </div>
        </div>

        {/* Resultados */}
        {(busca || (buscaDataInicio && buscaDataFim)) && (
          <div className="bg-white rounded-xl shadow-lg p-6">            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {busca ? `${t('download_file.results_for')} "${busca}"` : `${t('download_file.files_between')} ${buscaDataInicio.split('-').reverse().join('/')} e ${buscaDataFim.split('-').reverse().join('/')}`}
                <span className="text-sm text-gray-500 ml-2">
                  ({resultados.length} {resultados.length === 1 ? t('download_file.file') : t('download_file.files')})
                </span>
              </h3>
            </div>
            {carregando ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B4BFF]"></div>
              </div>
            ) : resultados.length > 0 ? (              <div className="space-y-2">
                {resultados.map((arquivo, idx) => (
                  <div
                    key={arquivo.id || idx}
                    className="flex justify-between items-center border-b border-gray-100 py-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => { setArquivoSelecionado(arquivo); setModalArquivo(true); }}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-black">
                        {arquivo.nome || arquivo.quem || arquivo.titulo || t('download_file.untitled_file')}
                      </div>
                      {arquivo.subNome && (
                        <div className="text-sm text-gray-600 mt-1">
                          {arquivo.subNome}
                        </div>
                      )}
                    </div>
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
                </div>                <h3 className="text-lg font-medium text-gray-700 mb-2">{t('download_file.no_results')}</h3>
                <p className="text-gray-500 mb-4">{t('download_file.try_different')}</p>
              </div>
            )}
            {/* Modal de detalhes do arquivo */}
            {modalArquivo && arquivoSelecionado && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6 sm:p-8 flex flex-col animate-fade-in">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] focus:ring-offset-2 z-10"
                    aria-label="Fechar modal"
                    onClick={() => setModalArquivo(false)}
                  >
                    &times;
                  </button>                  <h2 className="text-xl font-bold mb-2 text-[#7B4BFF] pr-8">
                    {arquivoSelecionado.nome || arquivoSelecionado.quem || arquivoSelecionado.titulo || t('download_file.untitled_file')}
                  </h2>
                  {arquivoSelecionado.subNome && (
                    <p className="text-md text-gray-600 mb-2 font-medium">
                      {arquivoSelecionado.subNome}
                    </p>
                  )}
                  <div className="mb-2 text-sm text-gray-500">
                    {t('download_file.creation_date')}: {(arquivoSelecionado.criadoEm || arquivoSelecionado.criadaEm)?.toDate?.()?.toLocaleDateString('pt-PT')}<br/>
                    {t('download_file.end_date_label')}: {arquivoSelecionado.dataFim?.toDate?.()?.toLocaleDateString('pt-PT') || (arquivoSelecionado.dataFim ? new Date(arquivoSelecionado.dataFim).toLocaleDateString('pt-PT') : '---')}
                  </div>
                  {arquivoSelecionado.categoria && (
                    <div className="mb-2 text-xs inline-block bg-[#7B4BFF]/10 text-[#7B4BFF] px-2 py-1 rounded-full">
                      {arquivoSelecionado.categoria}
                    </div>
                  )}
                  <div className="mt-4 text-gray-700 whitespace-pre-line">
                    {arquivoSelecionado.conteudo || arquivoSelecionado.oque || arquivoSelecionado.descricao || t('download_file.no_description')}
                  </div>
                  {/* Múltiplos anexos */}
                  {arquivoSelecionado.fileUrls && Array.isArray(arquivoSelecionado.fileUrls) && arquivoSelecionado.fileUrls.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        {arquivoSelecionado.fileUrls.length > 1 ? t('download_file.attachments') : t('download_file.attachment')}:
                      </h3>
                      <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                        {arquivoSelecionado.fileUrls.map((url, index) => (
                          <div key={index} className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 underline text-sm"
                            >
                              {arquivoSelecionado.fileNames && arquivoSelecionado.fileNames[index] 
                                ? arquivoSelecionado.fileNames[index]
                                : `Anexo ${index + 1}`
                              }
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : arquivoSelecionado.fileUrl ? (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">{t('download_file.attachment')}:</h3>
                      <div className="flex items-center bg-gray-50 p-3 rounded-md">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a href={arquivoSelecionado.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm">
                          {arquivoSelecionado.fileName || t('download_file.open_attachment')}
                        </a>
                      </div>                    </div>
                  ) : null}
                  
                  {/* Botões de ação */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={abrirModalEdicao}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t('editar')}
                    </button>
                    <button
                      onClick={() => setModalConfirmacao(true)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t('remover')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de edição */}
            {modalEdicao && arquivoEditando && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
                <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6 sm:p-8 animate-fade-in">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                    onClick={() => {setModalEdicao(false); setArquivoEditando(null);}}
                  >
                    &times;
                  </button>
                  
                  <h2 className="text-xl font-bold mb-6 text-[#7B4BFF] pr-8">{t('editarArquivo')}</h2>
                  
                  <div className="space-y-4">                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}*</label>
                      <input
                        type="text"
                        value={arquivoEditando.nome}
                        onChange={(e) => setArquivoEditando(prev => ({...prev, nome: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] text-gray-900"
                        required
                      />
                    </div>
                      <div>                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('subtituloOuCategoria')}</label>
                      <input
                        type="text"
                        placeholder={t('placeholderSubtitulo')}
                        value={arquivoEditando.subNome}
                        onChange={(e) => setArquivoEditando(prev => ({...prev, subNome: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('descricao')}</label>
                      <textarea
                        value={arquivoEditando.conteudo}
                        onChange={(e) => setArquivoEditando(prev => ({...prev, conteudo: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] h-24 text-gray-900"
                        rows={3}
                      />
                    </div>
                    
                    <div>                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('prioridade')}</label>
                      <select
                        value={arquivoEditando.prioridade}
                        onChange={(e) => setArquivoEditando(prev => ({...prev, prioridade: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] text-gray-900"
                      >
                        <option value="baixa">{t('baixa')}</option>
                        <option value="media">{t('media')}</option>
                        <option value="alta">{t('alta')}</option>
                      </select>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('upload_file.start_date')}</label>
                        <input
                          type="date"
                          value={arquivoEditando.dataInicio}
                          onChange={(e) => setArquivoEditando(prev => ({...prev, dataInicio: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] text-gray-900"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('upload_file.end_date')}</label>
                        <input
                          type="date"
                          value={arquivoEditando.dataFim}
                          onChange={(e) => setArquivoEditando(prev => ({...prev, dataFim: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {setModalEdicao(false); setArquivoEditando(null);}}                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      disabled={editando}
                    >
                      {t('cancelar')}
                    </button>
                    <button
                      onClick={salvarEdicao}
                      disabled={editando || !arquivoEditando.nome.trim()}
                      className="flex-1 bg-[#7B4BFF] hover:bg-[#6A3FE6] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {editando ? t('salvando') : t('salvar')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmação de remoção */}
            {modalConfirmacao && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
                <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('confirmarRemocao')}</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {t('temCertezaRemover', { nome: arquivoSelecionado?.nome })}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setModalConfirmacao(false)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        disabled={removendo}
                      >
                        {t('cancelar')}
                      </button>
                      <button
                        onClick={confirmarRemocao}
                        disabled={removendo}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {removendo ? t('removendo') : t('remover')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}</div>
        )}
      </div>
    </div>
    </PremiumGuard>
  );
}
