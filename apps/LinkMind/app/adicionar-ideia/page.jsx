"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { adicionarIdeia } from "../../lib/firebase/ideias";
import Link from "next/link";

export default function AdicionarIdeiaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSalvando(true);

    try {
      const novaIdeia = {
        titulo,
        categoria,
        descricao,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        prioridade
      };

      await adicionarIdeia(user.uid, novaIdeia);
      setSuccess("Ideia adicionada com sucesso!");
      
      // Limpar formulário
      setTitulo("");
      setCategoria("");
      setDescricao("");
      setDataInicio("");
      setDataFim("");
      setPrioridade("media");
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSalvando(false);
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-[#7B4BFF] hover:text-[#6B46C1]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Adicionar Nova Ideia</h1>
              <p className="text-gray-600">Capture e organize a sua inspiração</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Ideia *
              </label>
              <input 
                type="text" 
                placeholder="Ex: Aplicação de gestão de tarefas" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
                required 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select 
                value={categoria} 
                onChange={e => setCategoria(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
              >
                <option value="">Selecionar categoria...</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="negocios">Negócios</option>
                <option value="criativo">Criativo</option>
                <option value="pessoal">Pessoal</option>
                <option value="educacao">Educação</option>
                <option value="saude">Saúde</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <div className="flex space-x-4">
                {[
                  { value: "baixa", label: "Baixa", color: "from-green-400 to-green-500" },
                  { value: "media", label: "Média", color: "from-yellow-400 to-yellow-500" },
                  { value: "alta", label: "Alta", color: "from-red-400 to-red-500" }
                ].map(option => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="prioridade"
                      value={option.value}
                      checked={prioridade === option.value}
                      onChange={e => setPrioridade(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full mr-2 ${prioridade === option.value ? `bg-gradient-to-r ${option.color}` : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início (opcional)
                </label>
                <input 
                  type="date" 
                  value={dataInicio} 
                  onChange={e => setDataInicio(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim (opcional)
                </label>
                <input 
                  type="date" 
                  value={dataFim} 
                  onChange={e => setDataFim(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea 
                placeholder="Descreva a sua ideia em detalhes..." 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)} 
                required 
                rows="5"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="flex space-x-4">
              <button 
                type="submit" 
                disabled={salvando}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white p-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? "A guardar..." : "💡 Guardar Ideia"}
              </button>
              
              <Link 
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
