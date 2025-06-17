"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { uploadArquivo, obterSugestoesNomes } from "../../lib/firebase/arquivos";
import { uploadArquivo as uploadFileStorage } from "../../lib/firebase/storage";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import AutocompleteInput from "../../components/AutocompleteInput";
import HistoricoArquivo from "../../components/HistoricoArquivo";
import Link from "next/link";
import jsPDF from 'jspdf';

export default function UploadArquivoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [salvando, setSalvando] = useState(false);  
  
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [conteudoArquivo, setConteudoArquivo] = useState("");  const [quando, setQuando] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]); // Array para múltiplos arquivos
  const [filePreview, setFilePreview] = useState(null);
  const [fileUrl, setFileUrl] = useState("");const [sugestoesNomes, setSugestoesNomes] = useState([]);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState("");
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
    // Estados para câmera
  const [mostrarCamera, setMostrarCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturandoFoto, setCapturandoFoto] = useState(false);  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [mostrarPreviaFoto, setMostrarPreviaFoto] = useState(false);
  const [fotoCapturadaDaCamera, setFotoCapturadaDaCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "user" para frontal, "environment" para traseira
  
  const nomeInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);  useEffect(() => {
    if (nomeInputRef.current) nomeInputRef.current.focus();
  }, []);
  // Função para buscar sugestões de nomes de arquivos
  const buscarSugestoes = async (termo) => {
    if (termo.length < 2) {
      setSugestoesNomes([]);
      return;
    }

    try {
      setLoadingSugestoes(true);
      const sugestoes = await obterSugestoesNomes(user.displayName || "", termo);
      setSugestoesNomes(sugestoes);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      setSugestoesNomes([]);
    } finally {
      setLoadingSugestoes(false);
    }
  };

  // Manipular mudança no campo nome do arquivo
  const handleNomeArquivoChange = (valor) => {
    setNomeArquivo(valor);
    buscarSugestoes(valor);
    
    // Esconder histórico se o valor mudou
    if (valor !== arquivoSelecionado) {
      setMostrarHistorico(false);
      setArquivoSelecionado("");
    }
  };

  // Manipular seleção de arquivo do autocomplete
  const handleArquivoSelect = (arquivo) => {
    setArquivoSelecionado(arquivo);
    setMostrarHistorico(true);
    setSugestoesNomes([]);
  };  async function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files);
    
    // Limitar a 3 arquivos
    const newFiles = [...files, ...selectedFiles].slice(0, 3);
    setFiles(newFiles);
    
    // Manter compatibilidade com código existente - usar primeiro arquivo
    if (newFiles.length > 0) {
      const f = newFiles[0];
      setFile(f);
      if (f && f.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(f));
      } else {
        setFilePreview(null);
      }
    }
    
    // Limpar estados da câmera quando arquivo é selecionado manualmente
    setFotoCapturada(null);
    setFotoCapturadaDaCamera(false);
  }

  // Função para abrir a câmera
  async function abrirCamera() {
    try {
      setMostrarCamera(true);
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      // Aguardar um pouco para o vídeo carregar
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      alert("Erro ao acessar câmera. Verifique as permissões.");
      setMostrarCamera(false);
    }
  }

  // Função para alternar entre câmera frontal e traseira
  function alternarCamera() {
    const novoFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(novoFacingMode);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Reiniciar câmera com novo facing mode
    setTimeout(() => abrirCamera(), 100);
  }
  // Função para capturar foto da câmera
  async function capturarFoto() {
    if (!videoRef.current || !canvasRef.current) return;
    
    setCapturandoFoto(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Definir tamanho do canvas igual ao vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;      // Desenhar frame atual do vídeo no canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Converter para preto e branco para poupar espaço
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
      }
      
      context.putImageData(imageData, 0, 0);
      
      // Converter canvas para data URL para prévia
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Reduzir qualidade para poupar espaço
      setFotoCapturada(dataUrl);
      setFotoCapturadaDaCamera(true);
      
      // Converter canvas para blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          console.log("Convertendo foto para PDF..."); // Debug
          // Converter foto para PDF
          await converterFotoParaPDF(blob);
        }
      }, 'image/jpeg', 0.7); // Qualidade reduzida para poupar espaço
      
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      alert("Erro ao capturar foto.");
    } finally {
      setCapturandoFoto(false);
    }
  }

  // Função para converter foto em PDF
  async function converterFotoParaPDF(fotoBlob) {
    try {
      // Criar PDF
      const pdf = new jsPDF();
      
      // Converter blob para data URL
      const reader = new FileReader();
      reader.onload = function(e) {
        const imgData = e.target.result;
        
        // Adicionar imagem ao PDF
        const imgWidth = 180; // Largura da imagem no PDF
        const pageHeight = pdf.internal.pageSize.height;
        const imgHeight = (fotoBlob.size / 1000000) * 50; // Altura baseada no tamanho
        let heightLeft = imgHeight;
        
        let position = 20; // Margem superior
        
        // Adicionar imagem
        pdf.addImage(imgData, 'JPEG', 15, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Adicionar páginas se necessário
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 15, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Converter PDF para blob
        const pdfBlob = pdf.output('blob');
        
        // Criar arquivo File
        const pdfFile = new File([pdfBlob], `foto-${Date.now()}.pdf`, { type: 'application/pdf' });          // Definir como arquivo selecionado e adicionar ao array
        const novosArquivos = [...files, pdfFile].slice(0, 3); // Limitar a 3
        setFiles(novosArquivos);
        setFile(pdfFile); // Manter o último para compatibilidade
        setFilePreview(null); // PDFs não têm preview de imagem
          console.log("PDF criado com sucesso!");
        
        // Fechar câmera
        fecharCamera();
      };
      
      reader.readAsDataURL(fotoBlob);
      
    } catch (error) {
      console.error("Erro ao converter foto para PDF:", error);
      alert("Erro ao converter foto para PDF.");
    }
  }  // Função para fechar câmera
  function fecharCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setMostrarCamera(false);
    // Não limpar fotoCapturada aqui para manter a prévia
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSalvando(true);
    try {
      let uploadedUrl = "";
      if (file) {
        uploadedUrl = await uploadFileStorage(user.uid, file);
        setFileUrl(uploadedUrl);
      }
      const novoArquivo = {
        nome: nomeArquivo,
        conteudo: conteudoArquivo,
        categoria,
        prioridade,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        fileUrl: uploadedUrl || null,
        fileName: file ? file.name : null
      };
      // Corrigir: usar nome formatado como ID do documento do usuário
      const userNomeId = nomeParaIdFirestore(user.displayName || "");
      await uploadArquivo(userNomeId, novoArquivo);
      setSuccess("Arquivo enviado com sucesso!");
      setNomeArquivo("");
      setConteudoArquivo("");
      setCategoria("");
      setDataInicio("");
      setDataFim("");
      setPrioridade("media");      setFile(null);
      setFiles([]);
      setFilePreview(null);
      setFileUrl("");
      setFotoCapturada(null);
      setFotoCapturadaDaCamera(false);
      if (nomeInputRef.current) nomeInputRef.current.focus();
      setTimeout(() => {
        setSuccess("");
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSalvando(false);
    }
  }

  // Função para remover arquivo individual
  function removerArquivo(index) {
    const novosArquivos = files.filter((_, i) => i !== index);
    setFiles(novosArquivos);
    
    // Atualizar arquivo principal
    if (novosArquivos.length > 0) {
      const f = novosArquivos[0];
      setFile(f);
      if (f && f.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(f));
      } else {
        setFilePreview(null);
      }
    } else {
      setFile(null);
      setFilePreview(null);
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
            </Link>            <div>
              <h1 className="text-2xl font-bold text-gray-800">📁 Upload de Arquivo Mental</h1>
              <p className="text-gray-600">Envie e organize arquivos da sua mente auxiliar</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <AutocompleteInput
                ref={nomeInputRef}
                label="Nome do Arquivo *"
                placeholder="Nome do arquivo mental (ex: João Silva, Projeto X, Ideia Y)"
                value={nomeArquivo}
                onChange={handleNomeArquivoChange}
                onSelect={handleArquivoSelect}
                suggestions={sugestoesNomes}
                loading={loadingSugestoes}
                required
              />
            </div>
            
            {/* Mostrar histórico se arquivo foi selecionado */}
            {mostrarHistorico && arquivoSelecionado && (
              <HistoricoArquivo 
                userNome={user.displayName}
                nomeArquivo={arquivoSelecionado}
                onClose={() => setMostrarHistorico(false)}
              />
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo do Arquivo *</label>
              <textarea
                placeholder="Descreva o conteúdo do arquivo mental"
                value={conteudoArquivo}
                onChange={e => setConteudoArquivo(e.target.value)}
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
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

            {/* Quando - apenas título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quando</label>
            </div>

            {/* Datas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início (opcional)
                </label>                <input 
                  type="date" 
                  value={dataInicio} 
                  onChange={e => setDataInicio(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim (opcional)
                </label>                <input 
                  type="date" 
                  value={dataFim} 
                  onChange={e => setDataFim(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900"
                />
              </div>
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documento (PDF ou Imagem) - Máximo 3 arquivos
              </label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                multiple
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
                aria-label="Escolher documentos PDF ou imagens (máximo 3)"
                disabled={files.length >= 3}
              />
              {file && file.type.startsWith("image/") && filePreview && (
                <img src={filePreview} alt="Pré-visualização" className="mt-2 max-h-40 rounded" />
              )}              {file && file.type === "application/pdf" && (
                <div className="flex items-center justify-between mt-2 p-2 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-gray-700">{file.name} (P&B)</span>
                  </div>                  {fotoCapturadaDaCamera && fotoCapturada ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMostrarPreviaFoto(true)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Ver foto original"
                      >
                        👁️
                      </button>
                      <button
                        type="button"                        onClick={() => {
                          setFile(null);
                          setFiles([]);
                          setFotoCapturada(null);
                          setFilePreview(null);
                          setFotoCapturadaDaCamera(false);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Eliminar e tirar nova foto"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Sem prévia disponível</div>
                  )}
                </div>
              )}
              {fileUrl && (
                <div className="mt-2 text-green-700 text-sm">Arquivo enviado! <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline">Ver arquivo</a></div>
              )}            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Câmera</label>
              <button
                type="button"
                onClick={abrirCamera}
                className="px-4 py-2 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors"
              >
                📷 Tirar foto e guardar em PDF
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg text-base font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg text-base font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {success}
              </div>
            )}            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white p-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-disabled={salvando}
              >
                {salvando ? "A enviar..." : "� Upload do Arquivo"}
              </button>
              
              <Link 
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>        </div>

        {/* Modal da Câmera */}
        {mostrarCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative w-full h-full max-w-md max-h-screen bg-black flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-black/50 text-white">
                <h3 className="text-lg font-medium">📷 Capturar Foto</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={alternarCamera}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title="Alternar câmera"
                  >
                    🔄
                  </button>
                  <button
                    onClick={fecharCamera}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title="Fechar"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Área do vídeo */}
              <div className="flex-1 relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>

              {/* Controles */}
              <div className="p-6 bg-black/50">
                <div className="flex justify-center">
                  <button
                    onClick={capturarFoto}
                    disabled={capturandoFoto}
                    className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-[#7B4BFF] transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {capturandoFoto ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#7B4BFF] border-t-transparent"></div>
                    ) : (
                      <div className="w-12 h-12 bg-[#7B4BFF] rounded-full"></div>
                    )}
                  </button>
                </div>
                <p className="text-center text-white text-sm mt-2">
                  Toque para capturar e converter para PDF
                </p>
              </div>
            </div>
          </div>        )}

        {/* Modal de Prévia da Foto */}
        {mostrarPreviaFoto && fotoCapturada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
              {/* Header do modal */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-medium text-gray-900">📷 Foto Capturada</h3>
                <button
                  onClick={() => setMostrarPreviaFoto(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Fechar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Imagem */}
              <div className="p-4">
                <img 
                  src={fotoCapturada} 
                  alt="Foto capturada" 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg mx-auto"
                />
              </div>
                {/* Footer do modal */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600">
                  Esta foto foi convertida para PDF e está pronta para upload
                </p>
                <div className="flex gap-2">
                  <button                    onClick={() => {
                      setFile(null);
                      setFiles([]);
                      setFotoCapturada(null);
                      setFilePreview(null);
                      setFotoCapturadaDaCamera(false);
                      setMostrarPreviaFoto(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                  <button
                    onClick={() => setMostrarPreviaFoto(false)}
                    className="px-4 py-2 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
