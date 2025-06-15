"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { adicionarIdeia } from "../../lib/firebase/ideias";
import { uploadArquivo } from "../../lib/firebase/storage";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import Link from "next/link";

export default function AdicionarIdeiaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [quem, setQuem] = useState("");
  const [oque, setOque] = useState("");
  const [quando, setQuando] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const pessoaInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (pessoaInputRef.current) pessoaInputRef.current.focus();
  }, []);

  async function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSalvando(true);
    try {
      let uploadedUrl = "";
      if (file) {
        uploadedUrl = await uploadArquivo(user.uid, file);
        setFileUrl(uploadedUrl);
      }
      const novaIdeia = {
        quem,
        oque,
        categoria,
        prioridade,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        fileUrl: uploadedUrl || null,
        fileName: file ? file.name : null
      };
      // Corrigir: usar nome formatado como ID do documento do usuário
      const userNomeId = nomeParaIdFirestore(user.displayName || "");
      await adicionarIdeia(userNomeId, novaIdeia);
      setSuccess("Ideia adicionada com sucesso!");
      setQuem("");
      setOque("");
      setCategoria("");
      setDataInicio("");
      setDataFim("");
      setPrioridade("media");
      setFile(null);
      setFilePreview(null);
      setFileUrl("");
      if (pessoaInputRef.current) pessoaInputRef.current.focus();
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
              <h1 className="text-2xl font-bold text-gray-800">Upload</h1>
              <p className="text-gray-600">Capture e organize a sua mente auxiliar</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pessoa / Objeto / Ideia *</label>
              <input
                ref={pessoaInputRef}
                type="text"
                placeholder="Pessoa, objeto ou ideia principal"
                value={quem}
                onChange={e => setQuem(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">O que *</label>
              <input
                type="text"
                placeholder="O que é a ideia"
                value={oque}
                onChange={e => setOque(e.target.value)}
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Documento (PDF ou Imagem)</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
                aria-label="Escolher documento PDF ou imagem"
              />
              {file && file.type.startsWith("image/") && filePreview && (
                <img src={filePreview} alt="Pré-visualização" className="mt-2 max-h-40 rounded" />
              )}
              {file && file.type === "application/pdf" && (
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-gray-700">{file.name}</span>
                </div>
              )}
              {fileUrl && (
                <div className="mt-2 text-green-700 text-sm">Arquivo enviado! <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="underline">Ver arquivo</a></div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={async () => {
                  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.play();
                    // Aqui você pode implementar a captura da foto e conversão para PDF
                    alert('Abrir câmera e capturar foto (implementar lógica de captura e PDF)');
                  } else {
                    alert('Câmera não suportada neste dispositivo.');
                  }
                }}
                className="mt-2 px-4 py-2 bg-[#7B4BFF] text-white rounded-lg hover:bg-[#6B46C1] transition-colors"
              >
                Tirar foto e guardar em PDF
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
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white p-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-disabled={salvando}
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
