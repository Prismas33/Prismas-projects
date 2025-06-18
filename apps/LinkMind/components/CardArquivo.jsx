export default function CardArquivo({ arquivo }) {
  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return 'from-red-400 to-red-500';
      case 'media': return 'from-yellow-400 to-yellow-500';
      case 'baixa': return 'from-green-400 to-green-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'tecnologia': return '💻';
      case 'negocios': return '💼';
      case 'criativo': return '🎨';
      case 'pessoal': return '👤';
      case 'educacao': return '📚';
      case 'saude': return '🏥';
      default: return '💡';
    }
  };

  const formatarData = (data) => {
    if (!data) return '';
    
    if (data.toDate && typeof data.toDate === 'function') {
      return data.toDate().toLocaleDateString('pt-PT');
    }
    
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-PT');
    }
    
    if (typeof data === 'string') {
      return new Date(data).toLocaleDateString('pt-PT');
    }
    
    return '';
  };
  
  // Verificar se existem múltiplos arquivos
  const hasMultipleFiles = arquivo.fileUrls && Array.isArray(arquivo.fileUrls) && arquivo.fileUrls.length > 1;
  const fileCount = hasMultipleFiles ? arquivo.fileUrls.length : (arquivo.fileUrl ? 1 : 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Header with priority indicator */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getCategoriaIcon(arquivo.categoria)}</span>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{arquivo.nome || arquivo.titulo}</h3>
          </div>
          {arquivo.prioridade && (
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPrioridadeColor(arquivo.prioridade)} flex-shrink-0`}
                 title={`Prioridade ${arquivo.prioridade}`}>
            </div>
          )}
        </div>
        {/* Category tag */}
        {arquivo.categoria && (
          <span className="inline-block bg-[#7B4BFF]/10 text-[#7B4BFF] text-xs px-2 py-1 rounded-full font-medium mb-3">
            {arquivo.categoria.charAt(0).toUpperCase() + arquivo.categoria.slice(1)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {arquivo.conteudo || arquivo.descricao}
        </p>
        
        {/* Mostrar contador de arquivos anexados */}
        {fileCount > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-xs text-gray-600">
              {fileCount === 1 ? '1 documento anexado' : `${fileCount} documentos anexados`}
            </span>
          </div>
        )}

        {/* Lista de arquivos (quando há múltiplos) */}
        {hasMultipleFiles && (
          <div className="mb-3 space-y-1 bg-gray-50 p-2 rounded-md">
            {arquivo.fileUrls.map((url, index) => (
              <div key={index} className="flex items-center text-xs">
                <svg className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#7B4BFF] hover:text-[#6B46C1] truncate"
                >
                  {arquivo.fileNames && arquivo.fileNames[index] ? arquivo.fileNames[index] : `Documento ${index+1}`}
                </a>
              </div>
            ))}
          </div>
        )}
        
        {/* Dates */}
        {(arquivo.dataInicio || arquivo.dataFim) && (
          <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
            {arquivo.dataInicio && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Início: {formatarData(arquivo.dataInicio)}</span>
              </div>
            )}
            {arquivo.dataFim && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Fim: {formatarData(arquivo.dataFim)}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {formatarData(arquivo.criadoEm) || 'Hoje'}
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="text-[#7B4BFF] hover:text-[#6B46C1] transition-colors"
              title="Ver detalhes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
