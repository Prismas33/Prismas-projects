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
import { useI18n } from "../../lib/context/I18nContext";

export default function UploadArquivoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
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
  const [fotosCapturadas, setFotosCapturadas] = useState({}); // Mapear arquivo -> foto
  const [fotoAtualPrevia, setFotoAtualPrevia] = useState(null);
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
    
    // Limitar a 3 arquivos no total
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
    
    // Limpar o campo de input para permitir selecionar os mesmos arquivos novamente se necessário
    e.target.value = '';
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
          // Converter foto para PDF e salvar foto associada
          const pdfFile = await converterFotoParaPDF(blob, dataUrl);
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
  async function converterFotoParaPDF(fotoBlob, fotoDataUrl) {
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
        const pdfFile = new File([pdfBlob], `foto-${Date.now()}.pdf`, { type: 'application/pdf' });        // Definir como arquivo selecionado e adicionar ao array
        const novosArquivos = [...files, pdfFile].slice(0, 3); // Limitar a 3
        setFiles(novosArquivos);
        setFile(pdfFile); // Manter o último para compatibilidade
        setFilePreview(null); // PDFs não têm preview de imagem
        
        // Salvar a foto associada ao arquivo PDF
        setFotosCapturadas(prev => ({
          ...prev,
          [pdfFile.name]: fotoDataUrl
        }));
        
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
      // Array para armazenar URLs de todos os arquivos
      let uploadedUrls = [];
      let fileNames = [];
      
      // Fazer upload de todos os arquivos (até 3)
      if (files.length > 0) {
        for (const fileItem of files) {
          const uploadedUrl = await uploadFileStorage(user.uid, fileItem);
          uploadedUrls.push(uploadedUrl);
          fileNames.push(fileItem.name);
        }
      }
      
      const novoArquivo = {
        nome: nomeArquivo,
        conteudo: conteudoArquivo,
        categoria,
        prioridade,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        fileUrls: uploadedUrls.length > 0 ? uploadedUrls : null, // Array de URLs
        fileNames: fileNames.length > 0 ? fileNames : null, // Array de nomes
        // Manter compatibilidade com código anterior
        fileUrl: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
        fileName: fileNames.length > 0 ? fileNames[0] : null
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
      setPrioridade("media");
      setFile(null);
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
    const arquivoRemovido = files[index];
    const novosArquivos = files.filter((_, i) => i !== index);
    setFiles(novosArquivos);
    
    // Remover foto associada se for da câmera
    if (arquivoRemovido && arquivoRemovido.name.includes("foto-")) {
      setFotosCapturadas(prev => {
        const novasFotos = { ...prev };
        delete novasFotos[arquivoRemovido.name];
        return novasFotos;
      });
    }
    
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
      <div className="max-w-2xl mx-auto">        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-2">
            <Link href="/dashboard" className="text-[#7B4BFF] hover:text-[#6B46C1]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-7 h-7 text-yellow-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              {t('upload_file.title')}
            </h1>
          </div>
          <p className="text-gray-600 ml-10">{t('upload_file.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <AutocompleteInput
                ref={nomeInputRef}
                label={t('upload_file.file_name')}
                placeholder={t('upload_file.file_name_placeholder')}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('upload_file.file_content')}</label>
              <textarea
                placeholder={t('upload_file.file_content_placeholder')}
                value={conteudoArquivo}
                onChange={e => setConteudoArquivo(e.target.value)}
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('upload_file.priority')}</label>
              <div className="flex space-x-4">
                {[
                  { value: "baixa", label: t('upload_file.priority_low'), color: "from-green-400 to-green-500" },
                  { value: "media", label: t('upload_file.priority_medium'), color: "from-yellow-400 to-yellow-500" },
                  { value: "alta", label: t('upload_file.priority_high'), color: "from-red-400 to-red-500" }
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('upload_file.when')}</label>
            </div>

            {/* Datas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('upload_file.start_date')}
                </label>                <input 
                  type="date" 
                  value={dataInicio} 
                  onChange={e => setDataInicio(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('upload_file.end_date')}
                </label>                <input 
                  type="date" 
                  value={dataFim} 
                  onChange={e => setDataFim(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900"
                />
              </div>
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('upload_file.document')} - {t('upload_file.max_files', { count: 3 })}
              </label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                multiple
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
                aria-label={t('upload_file.choose_documents')}
                disabled={files.length >= 3}
              />
              
              {/* Lista de arquivos selecionados */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm text-gray-700 font-medium mb-1">
                    {files.length} {files.length === 1 ? t('upload_file.file_selected') : t('upload_file.files_selected')}:
                  </div>
                  
                  {files.map((arquivo, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {arquivo.type.startsWith("image/") ? (
                          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                        <span className="text-gray-700 truncate">{arquivo.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Prévia para imagens da câmera */}
                        {fotosCapturadas[arquivo.name] && (
                          <button
                            type="button"
                            onClick={() => {
                              setFotoAtualPrevia(fotosCapturadas[arquivo.name]);
                              setMostrarPreviaFoto(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title={t('upload_file.view_original_photo')}
                          >
                            👁️
                          </button>
                        )}
                        
                        {/* Botão para remover arquivo */}
                        <button
                          type="button"
                          onClick={() => removerArquivo(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title={t('upload_file.remove_file')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Preview primeiro arquivo imagem */}
              {file && file.type.startsWith("image/") && filePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">{t('upload_file.image_preview')}:</p>
                  <img src={filePreview} alt="Pré-visualização" className="max-h-40 rounded border" />
                </div>
              )}
              
              {fileUrl && (
                <div className="mt-2 text-green-700 text-sm">{t('upload_file.file_uploaded')} <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline">{t('upload_file.view_file')}</a></div>
              )}            </div><div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('upload_file.camera')}</label>
              <button
                type="button"
                onClick={abrirCamera}
                disabled={files.length >= 3}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  files.length >= 3 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-[#7B4BFF] text-white hover:bg-[#6B46C1]'
                }`}
              >
                📷 {t('upload_file.take_photo_pdf')}
              </button>
              {files.length >= 3 && (
                <p className="mt-1 text-xs text-gray-500">{t('upload_file.max_files_reached')}</p>
              )}
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
                {salvando ? t('upload_file.sending') : t('upload_file.upload_file')}
              </button>
              
              <Link 
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('upload_file.cancel')}
              </Link>
            </div>
          </form>        </div>

        {/* Modal da Câmera */}
        {mostrarCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden">
            <div className="relative w-full h-full sm:max-w-md md:max-h-[90vh] bg-black flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-2 sm:p-4 bg-black/50 text-white">
                <h3 className="text-base sm:text-lg font-medium">{t('upload_file.capture_photo')}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={alternarCamera}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title={t('upload_file.switch_camera')}
                  >
                    🔄
                  </button>
                  <button
                    onClick={fecharCamera}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title={t('upload_file.close')}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Área do vídeo */}
              <div className="flex-1 relative overflow-hidden">
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
              <div className="p-3 sm:p-6 bg-black/50 sticky bottom-0">
                <div className="flex justify-center">
                  <button
                    onClick={capturarFoto}
                    disabled={capturandoFoto}
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full border-4 border-gray-300 hover:border-[#7B4BFF] transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {capturandoFoto ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#7B4BFF] border-t-transparent"></div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7B4BFF] rounded-full"></div>
                    )}
                  </button>
                </div>
                <p className="text-center text-white text-xs sm:text-sm mt-2">
                  {t('upload_file.tap_capture')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Prévia da Foto */}
        {mostrarPreviaFoto && fotoCapturada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 overflow-hidden">
            <div className="relative w-full h-full sm:max-w-4xl sm:max-h-[90vh] sm:h-auto bg-white sm:rounded-lg overflow-hidden">
              {/* Header do modal */}
              <div className="flex items-center justify-between p-2 sm:p-4 bg-gray-50 border-b">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('upload_file.captured_photo')}</h3>
                <button
                  onClick={() => setMostrarPreviaFoto(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title={t('upload_file.close')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Imagem - conteúdo principal com scroll se necessário */}
              <div className="p-2 sm:p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                <img 
                  src={fotoAtualPrevia || fotoCapturada} 
                  alt="Foto capturada" 
                  className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg mx-auto"
                />
              </div>
              
              {/* Footer do modal - sticky para garantir que seja sempre visível */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 bg-gray-50 border-t sticky bottom-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
                  {t('upload_file.photo_converted')}
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setMostrarPreviaFoto(false);
                      setFotoAtualPrevia(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors text-sm sm:text-base"
                  >
                    {t('upload_file.close')}
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
