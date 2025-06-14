"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { buscarIdeias, obterSugestoes } from "../../lib/firebase/ideias";
import CardIdeia from "../../components/CardIdeia";
import Link from "next/link";

export default function BuscarIdeiaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      carregarTodasIdeias();
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
        carregarTodasIdeias();
        setSugestoes([]);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [busca, filtroCategoria, filtroPrioridade]);

  async function carregarTodasIdeias() {
    if (!user) return;
    
    setCarregando(true);
    try {
      const ideias = await buscarIdeias(user.uid);
      let ideilasFiltradas = ideias;

      // Aplicar filtros
      if (filtroCategoria) {
        ideilasFiltradas = ideilasFiltradas.filter(ideia => ideia.categoria === filtroCategoria);
      }
      if (filtroPrioridade) {
        ideilasFiltradas = ideilasFiltradas.filter(ideia => ideia.prioridade === filtroPrioridade);
      }

      setResultados(ideilasFiltradas);
    } catch (error) {
      console.error("Erro ao carregar ideias:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function realizarBusca() {
    if (!user) return;
    
    setCarregando(true);
    try {
      const ideias = await buscarIdeias(user.uid, busca);
      let ideilasFiltradas = ideias;

      // Aplicar filtros
      if (filtroCategoria) {
        ideilasFiltradas = ideilasFiltradas.filter(ideia => ideia.categoria === filtroCategoria);
      }
      if (filtroPrioridade) {
        ideilasFiltradas = ideilasFiltradas.filter(ideia => ideia.prioridade === filtroPrioridade);
      }

      setResultados(ideilasFiltradas);
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
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Buscar Ideias</h1>
              <p className="text-gray-600">Encontre as suas inspirações guardadas</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por título, descrição ou categoria..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
            />
            
            {/* Autocomplete Dropdown */}
            {mostrarSugestoes && sugestoes.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                {sugestoes.map((sugestao, index) => (
                  <button
                    key={index}
                    onClick={() => selecionarSugestao(sugestao)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {sugestao}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select 
              value={filtroCategoria} 
              onChange={e => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              <option value="tecnologia">Tecnologia</option>
              <option value="negocios">Negócios</option>
              <option value="criativo">Criativo</option>
              <option value="pessoal">Pessoal</option>
              <option value="educacao">Educação</option>
              <option value="saude">Saúde</option>
              <option value="outro">Outro</option>
            </select>

            <select 
              value={filtroPrioridade} 
              onChange={e => setFiltroPrioridade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent"
            >
              <option value="">Todas as prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>

            {(filtroCategoria || filtroPrioridade) && (
              <button
                onClick={() => {
                  setFiltroCategoria("");
                  setFiltroPrioridade("");
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {busca ? `Resultados para "${busca}"` : "Todas as suas ideias"}
              <span className="text-sm text-gray-500 ml-2">
                ({resultados.length} {resultados.length === 1 ? "ideia" : "ideias"})
              </span>
            </h3>
          </div>

          {carregando ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B4BFF]"></div>
            </div>
          ) : resultados.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resultados.map((ideia) => (
                <CardIdeia key={ideia.id} ideia={ideia} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {busca ? "Nenhum resultado encontrado" : "Ainda não tem ideias guardadas"}
              </h3>
              <p className="text-gray-500 mb-4">
                {busca 
                  ? "Tente usar palavras-chave diferentes ou remover os filtros." 
                  : "Comece a adicionar as suas ideias para as poder encontrar aqui."
                }
              </p>
              {!busca && (
                <Link 
                  href="/adicionar-ideia"
                  className="inline-flex items-center px-4 py-2 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar primeira ideia
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
