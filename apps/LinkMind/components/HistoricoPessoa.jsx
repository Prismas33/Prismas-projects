"use client";
import { useState, useEffect } from "react";
import { obterHistoricoPessoa } from "../lib/firebase/ideias";

export default function HistoricoPessoa({ userNome, pessoa, onClose }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pessoa && userNome) {
      carregarHistorico();
    }
  }, [pessoa, userNome]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const dados = await obterHistoricoPessoa(userNome, pessoa);
      setHistorico(dados);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return "Data não disponível";
    const dataObj = data.toDate ? data.toDate() : new Date(data);
    return dataObj.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!pessoa) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-blue-900">
          Histórico: {pessoa}
        </h3>
        <button
          onClick={onClose}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2 text-blue-600">Carregando histórico...</span>
        </div>
      ) : historico.length === 0 ? (
        <p className="text-blue-700">Esta será a primeira ideia sobre {pessoa}!</p>
      ) : (
        <div className="space-y-3 max-h-40 overflow-y-auto">
          <p className="text-sm text-blue-700 font-medium">
            {historico.length} ideia{historico.length !== 1 ? 's' : ''} anterior{historico.length !== 1 ? 'es' : ''}:
          </p>
          {historico.map((ideia, index) => (
            <div key={index} className="bg-white rounded-md p-3 border border-blue-100">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-gray-900">{ideia.oque}</p>
                <span className="text-xs text-gray-500">{formatarData(ideia.criadaEm)}</span>
              </div>
              {ideia.categoria && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {ideia.categoria}
                </span>
              )}
              {ideia.prioridade && (
                <span className={`inline-block text-xs px-2 py-1 rounded-full ml-1 ${
                  ideia.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                  ideia.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ideia.prioridade}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
