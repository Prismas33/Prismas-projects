"use client";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { trocarSenha, excluirConta, logoutUtilizador, obterDadosUtilizador, atualizarFotoPerfil, aplicarCodigoSecreto, verificarAcessoPremium } from "../../lib/firebase/auth";
import { uploadArquivo } from "../../lib/firebase/storage";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import Link from "next/link";
import { useI18n } from "../../lib/context/I18nContext";

export default function SettingsPage() {  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const [showDelete, setShowDelete] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");
  const [loading, setLoading] = useState(false);
  const [exportingFiles, setExportingFiles] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(true);  const [uploadingFoto, setUploadingFoto] = useState(false);
    // Estados para código de cupom
  const [codigoCupom, setCodigoCupom] = useState("");
  const [aplicandoCodigo, setAplicandoCodigo] = useState(false);
  const [mostrarFormularioCodigo, setMostrarFormularioCodigo] = useState(false);
  // Estados para assinatura
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      carregarDadosUsuario();
    }
  }, [user, authLoading, router]);async function carregarDadosUsuario() {
    if (!user) return;
    try {
      setCarregandoDados(true);
      const nomeId = nomeParaIdFirestore(user.displayName || "");
      const dados = await obterDadosUtilizador(nomeId);
      console.log("Dados do usuário carregados:", dados);
      // Garantir que a propriedade arquivos existe
      if (!dados.arquivos) {
        dados.arquivos = [];
      }
      setDadosUsuario(dados);
      
      // Carregar dados da assinatura se tiver
      if (dados.subscriptionStatus === 'active' && dados.paypalSubscriptionId) {
        await carregarDadosAssinatura();
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregandoDados(false);
    }
  }
  async function carregarDadosAssinatura() {
    if (!user?.displayName) return;
    
    try {
      setLoadingSubscription(true);
      const response = await fetch(`/api/paypal/get-subscription?userDisplayName=${encodeURIComponent(user.displayName)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('API route não encontrada - funcionalidade pode não estar disponível');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.hasSubscription) {
        setSubscriptionData(data.subscription);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da assinatura:", error);
      // Não mostrar erro ao usuário se for apenas a API não estar disponível
    } finally {
      setLoadingSubscription(false);
    }
  }
  async function handleCancelSubscription() {
    // Verificar diferentes possíveis campos de ID da assinatura
    const subscriptionId = dadosUsuario?.paypalSubscriptionId || dadosUsuario?.subscriptionID;
      if (!subscriptionId || !user?.displayName) {
      setError(t('configuracoes.assinatura.erroEncontrarAssinatura'));
      return;
    }
    
    try {
      setCancellingSubscription(true);
      setError("");
      
      const response = await fetch('/api/paypal/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          userDisplayName: user.displayName,
          reason: 'Cancelamento solicitado pelo usuário nas configurações'
        })
      });

      const data = await response.json();      if (data.success) {
        setSuccess(t('configuracoes.assinatura.assinaturaCanceladaSucesso'));
        setShowCancelConfirmation(false);
        // Recarregar dados do usuário
        await carregarDadosUsuario();
      } else {
        setError(data.error || t('configuracoes.assinatura.erroCancelarAssinatura'));
      }
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      setError(t('configuracoes.assinatura.erroCancelarAssinatura'));
    } finally {
      setCancellingSubscription(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7B4BFF]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  async function handleTrocarSenha(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");    if (novaSenha !== confirmarSenha) {
      setError(t('configuracoes.seguranca.senhasNaoCoincidem') || "As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      // Aqui você precisaria ter uma função que verifica a senha atual antes de permitir a troca
      await trocarSenha(novaSenha, senhaAtual);
      setSuccess(t('configuracoes.seguranca.senhaAlteradaSucesso') || "Senha alterada com sucesso!");
      setShowChangePass(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportarArquivos() {
    try {
      setExportingFiles(true);
      // Aqui você implementaria o código para exportar os arquivos como PDF
      // Por exemplo, chamando uma API ou gerando o PDF localmente
      
      // Simulação de tempo para exportação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (err) {
      console.error("Erro ao exportar arquivos:", err);
      setError((t('configuracoes.exportarExcluir.erroExportacao') || "Não foi possível exportar os arquivos: ") + err.message);
      return false;
    } finally {
      setExportingFiles(false);
    }
  }
  async function handleExcluirConta() {
    setLoading(true);
    setError("");
    
    const textoConfirmacao = lang === 'pt' ? "confirmar exclusao" : "confirm deletion";
    if (confirmacaoExclusao !== textoConfirmacao) {
      setError(t('configuracoes.exportarExcluir.erroConfirmacao') || `Por favor, digite '${textoConfirmacao}' para prosseguir.`);
      setLoading(false);
      return;
    }

    try {
      // Primeiro exportar os arquivos
      const arquivosExportados = await exportarArquivos();
      
      if (arquivosExportados) {
        // Depois excluir a conta
        await excluirConta();
        await logoutUtilizador();
        router.push("/login");
      } else {
        throw new Error(t('configuracoes.exportarExcluir.erroAntesDeletar') || "Não foi possível exportar os arquivos antes de excluir a conta.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
      if (!file.type.startsWith('image/')) {
      setError(t('configuracoes.informacoesPessoais.erroTipoArquivo') || 'Por favor, selecione apenas arquivos de imagem.');
      return;
    }setUploadingFoto(true);
    setError("");
    try {
      const fotoUrl = await uploadArquivo(user.uid, file);
      const nomeId = nomeParaIdFirestore(user.displayName || "");
      await atualizarFotoPerfil(nomeId, fotoUrl);
      setDadosUsuario(prev => ({ ...prev, fotoPerfil: fotoUrl }));
      setSuccess(t('configuracoes.informacoesPessoais.fotoAtualizadaSucesso') || "Foto de perfil atualizada com sucesso!");
    } catch (err) {
      setError(err.message);    } finally {
      setUploadingFoto(false);
    }
  }
  async function handleAplicarCodigo() {
    if (!codigoCupom.trim()) {
      setError(t('configuracoes.cupom.inserirCodigoError'));
      return;
    }

    try {
      setAplicandoCodigo(true);
      setError("");
      setSuccess("");
      
      const nomeId = nomeParaIdFirestore(user.displayName || "");
      const resultado = await aplicarCodigoSecreto(nomeId, codigoCupom.trim());
      
      if (resultado.success) {
        setSuccess(resultado.message);
        setCodigoCupom("");
        setMostrarFormularioCodigo(false);
        // Recarregar dados do utilizador
        await carregarDadosUsuario();
      } else {
        setError(resultado.message);
      }
    } catch (error) {
      console.error("Erro ao aplicar código:", error);
      setError(t('configuracoes.cupom.erroAplicarCodigo'));
    } finally {
      setAplicandoCodigo(false);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com botão de voltar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <button className="text-gray-500 hover:text-[#7B4BFF] transition-colors" title="Voltar">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('configuracoes.conta.titulo')}</h1>
              <p className="text-gray-600">{t('configuracoes.conta.subtitulo')}</p>
            </div>
          </div>
        </div>        {/* Informações pessoais */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#7B4BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{t('configuracoes.informacoesPessoais.titulo')}</span>
          </h2>
          
          {carregandoDados ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7B4BFF]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#7B4BFF]/20 shadow-lg">
                    {dadosUsuario?.fotoPerfil ? (
                      <img 
                        src={dadosUsuario.fotoPerfil} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2A3F9E] to-[#7B4BFF] flex items-center justify-center text-white text-3xl font-bold">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  {uploadingFoto && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <label className="cursor-pointer bg-[#7B4BFF] text-white px-4 py-2 rounded-lg hover:bg-[#6A3FEF] transition-colors text-sm font-medium">
                    {dadosUsuario?.fotoPerfil ? t('configuracoes.informacoesPessoais.alterarFoto') : t('configuracoes.informacoesPessoais.adicionarFoto')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFotoUpload}
                      className="hidden"
                      disabled={uploadingFoto}
                    />
                  </label>
                  <p className="text-xs text-gray-500">{t('configuracoes.informacoesPessoais.formatosPermitidos') || "JPG, PNG ou GIF (máx. 5MB)"}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.informacoesPessoais.nomeCompleto')}</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {user.displayName || dadosUsuario?.nome || t('configuracoes.informacoesPessoais.naoInformado')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.informacoesPessoais.email')}</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.informacoesPessoais.provedorLogin')}</label>                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : t('configuracoes.informacoesPessoais.emailSenha') || 'Email/Senha'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.informacoesPessoais.membroDesde')}</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {dadosUsuario?.criadoEm?.toDate?.()?.toLocaleDateString('pt-PT') || 
                     user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-PT') : 
                     t('configuracoes.informacoesPessoais.dataNaoDisponivel')}
                  </div>
                </div>
              </div>
              {/* Seletor de idioma profissional - agora entre login provider e total files */}
              <div className="w-full py-2 px-4 rounded-lg bg-gray-100 flex items-center space-x-3 mt-4 mb-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <label htmlFor="lang-select" className="text-gray-700 text-sm font-medium min-w-max">
                  {t('language')}:
                </label>
                <select
                  id="lang-select"
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B4BFF]"
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.informacoesPessoais.totalArquivos')}</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                  {Array.isArray(dadosUsuario?.arquivos) ? dadosUsuario.arquivos.length : 0} {t('configuracoes.informacoesPessoais.arquivosGuardados')}
                </div>
              </div>
            </div>
          )}
        </div>        {/* Card principal com as opções */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#7B4BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t('configuracoes.seguranca.titulo')}</span>
          </h2>
          <div className="space-y-4">
            {/* Mostrar opção de criar/trocar senha */}
            <button 
              className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3"
              onClick={() => setShowChangePass(true)}
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{user.providerData?.[0]?.providerId === 'google.com' ? t('configuracoes.seguranca.criarSenha') : t('configuracoes.seguranca.trocarSenha')}</span>
            </button>
            
            {/* Botão de exportar e excluir conta */}
            <button 
              className="w-full py-3 px-4 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-all flex items-center justify-center space-x-3"
              onClick={() => setShowDelete(true)}
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{t('configuracoes.exportarExcluir.titulo')}</span>
            </button>
          </div>
        </div>        {/* Outras opções */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#7B4BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{t('configuracoes.outrasOpcoes.titulo')}</span>
          </h2>
          <div className="space-y-3">              <button 
              className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-left"
              onClick={() => alert(t('configuracoes.outrasOpcoes.funcionalidadeEmBreve') || 'Funcionalidade em breve!')}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5l-5-5h5v-5z" />
                </svg>
                <span>{t('configuracoes.outrasOpcoes.backupAutomatico')}</span>
              </div>
            </button>
          </div>
        </div>{/* Modal de troca de senha */}
        {showChangePass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {user.providerData?.[0]?.providerId === 'google.com' ? t('configuracoes.seguranca.criarSenha') : t('configuracoes.seguranca.trocarSenha')}
                </h3>
                <button 
                  onClick={() => setShowChangePass(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-5">
                <p className="text-blue-700 text-sm">
                  {user.providerData?.[0]?.providerId === 'google.com' 
                    ? t('configuracoes.seguranca.criarSenhaDescricao')
                    : t('configuracoes.seguranca.trocarSenhaDescricao')}
                </p>
              </div>

              <form onSubmit={handleTrocarSenha} className="space-y-5">
                {user.providerData?.[0]?.providerId !== 'google.com' && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">{t('configuracoes.seguranca.senhaAtual')}</label>
                    <input 
                      type="password" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all" 
                      value={senhaAtual} 
                      onChange={e => setSenhaAtual(e.target.value)} 
                      required 
                      disabled={loading}
                      placeholder={t('configuracoes.seguranca.digiteSenhaAtual')}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-medium mb-2">{t('configuracoes.seguranca.novaSenha')}</label>
                  <input 
                    type="password" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all" 
                    value={novaSenha} 
                    onChange={e => setNovaSenha(e.target.value)} 
                    required 
                    minLength={6} 
                    disabled={loading}
                    placeholder={t('configuracoes.seguranca.digiteNovaSenha')}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">{t('configuracoes.seguranca.confirmarNovaSenha')}</label>
                  <input 
                    type="password" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all" 
                    value={confirmarSenha} 
                    onChange={e => setConfirmarSenha(e.target.value)} 
                    required 
                    minLength={6} 
                    disabled={loading}
                    placeholder={t('configuracoes.seguranca.digiteNovaSenhaNovamente')}
                  />
                  {novaSenha !== confirmarSenha && confirmarSenha && (
                    <p className="text-red-500 text-sm mt-1">{t('configuracoes.seguranca.senhasNaoCoincidem')}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
                    onClick={() => setShowChangePass(false)} 
                    disabled={loading}
                  >
                    {t('geral.cancelar')}
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50" 
                    disabled={loading || novaSenha.length < 6 || novaSenha !== confirmarSenha || (user.providerData?.[0]?.providerId !== 'google.com' && !senhaAtual)}
                  >
                    {loading ? t('geral.processando') : t('geral.confirmar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}        {/* Modal de confirmação de exclusão */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-700">{t('configuracoes.exportarExcluir.tituloModal')}</h3>
                <button 
                  onClick={() => setShowDelete(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading || exportingFiles}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-red-50 p-4 rounded-lg mb-5 space-y-2">
                <p className="text-red-700">
                  <strong>{t('configuracoes.exportarExcluir.atencao')}:</strong> {t('configuracoes.exportarExcluir.descricao1')}
                </p>
                <p className="text-red-700">
                  {t('configuracoes.exportarExcluir.descricao2')}
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">{t('configuracoes.exportarExcluir.confirmacao')}</label>                <input 
                  type="text" 
                  className="w-full border border-red-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                  value={confirmacaoExclusao} 
                  onChange={e => setConfirmacaoExclusao(e.target.value)} 
                  disabled={loading || exportingFiles}
                  placeholder={lang === 'pt' ? "confirmar exclusao" : "confirm deletion"}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
                  onClick={() => setShowDelete(false)} 
                  disabled={loading || exportingFiles}
                >
                  {t('geral.cancelar')}
                </button>                <button 
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2" 
                  onClick={handleExcluirConta} 
                  disabled={loading || exportingFiles || confirmacaoExclusao !== (lang === 'pt' ? "confirmar exclusao" : "confirm deletion")}
                >
                  {exportingFiles && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>
                    {loading ? t('geral.excluindoConta') : 
                     exportingFiles ? t('geral.exportandoArquivos') : 
                     t('configuracoes.exportarExcluir.excluirConta')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}        {/* Informações de Assinatura */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#7B4BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-3-3h6m-6 0h6"/>
            </svg>
            <span>{t('configuracoes.assinatura.titulo')}</span>
          </h2>
          
          {carregandoDados ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7B4BFF]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status da Assinatura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.assinatura.statusConta')}</label>
                  <div className={`border rounded-lg px-3 py-2 text-sm font-medium ${
                    dadosUsuario?.subscriptionStatus === 'premium_free' ? 'bg-green-50 border-green-200 text-green-800' :
                    dadosUsuario?.subscriptionStatus === 'active' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    dadosUsuario?.subscriptionStatus === 'trial' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                    'bg-red-50 border-red-200 text-red-800'
                  }`}>                    {dadosUsuario?.subscriptionStatus === 'premium_free' ? t('configuracoes.assinatura.premiumGratuito') :
                     dadosUsuario?.subscriptionStatus === 'active' ? t('configuracoes.assinatura.premiumAtivo') :
                     dadosUsuario?.subscriptionStatus === 'trial' ? t('configuracoes.assinatura.trialAtivo') :
                     t('configuracoes.assinatura.trialExpirado')}
                  </div>
                </div>

                {dadosUsuario?.subscriptionStatus === 'trial' && dadosUsuario?.trialEndDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.assinatura.trialValidoAte')}</label>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-yellow-800 text-sm">
                      {new Date(dadosUsuario.trialEndDate.seconds * 1000).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                )}

                {dadosUsuario?.planType && (
                  <div>                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.assinatura.planoAtual')}</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-800 text-sm font-medium">
                      {dadosUsuario.planType === 'monthly' ? t('configuracoes.assinatura.mensal') : t('configuracoes.assinatura.anual')}
                    </div>
                  </div>
                )}

                {dadosUsuario?.hasSecretCode && (
                  <div>                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('configuracoes.assinatura.acessoEspecial')}</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800 text-sm font-medium">
                      {t('configuracoes.assinatura.codigoAcessoUtilizado')}
                    </div>
                  </div>
                )}
              </div>

              {/* Ações baseadas no status */}
              <div className="pt-4 border-t border-gray-200">
                {dadosUsuario?.subscriptionStatus === 'trial' && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">                    <h3 className="font-medium text-gray-800 mb-2">{t('configuracoes.assinatura.aproveiteTrial')}</h3>                    <p className="text-sm text-gray-600 mb-3">
                      {t('configuracoes.assinatura.acessoCompletoTrial')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href="/subscription">
                        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          {t('configuracoes.assinatura.verPlanos')}
                        </button>
                      </Link>
                    </div>
                  </div>
                )}

                {dadosUsuario?.subscriptionStatus === 'expired' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">                    <h3 className="font-medium text-red-800 mb-2">{t('configuracoes.assinatura.trialExpiradoTitulo')}</h3>                    <p className="text-sm text-red-600 mb-3">
                      {t('configuracoes.assinatura.trialExpiradoDescricao')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href="/subscription">                        <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          {t('configuracoes.assinatura.subscreverAgora')}
                        </button>
                      </Link>
                    </div>
                  </div>
                )}                {dadosUsuario?.subscriptionStatus === 'active' && (dadosUsuario?.subscriptionID || dadosUsuario?.paypalSubscriptionId) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">                    <h3 className="font-medium text-blue-800 mb-2">{t('configuracoes.assinatura.subscricaoAtiva')}</h3>
                    <p className="text-sm text-blue-600 mb-2">
                      {t('configuracoes.assinatura.obrigadoSubscritor')}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {t('configuracoes.assinatura.idSubscricao')} {dadosUsuario.subscriptionID}
                    </p>
                      {/* Informações detalhadas da assinatura */}
                    {subscriptionData && !loadingSubscription && (
                      <div className="bg-white rounded-lg p-3 mb-3 border border-blue-100">
                        <div className="grid grid-cols-2 gap-2 text-xs">                          <div>
                            <span className="text-gray-500">{t('configuracoes.assinatura.status')}</span>
                            <span className="ml-1 font-medium capitalize">{subscriptionData.status}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('configuracoes.assinatura.plano')}</span>
                            <span className="ml-1 font-medium">{subscriptionData.plan_id?.includes('monthly') ? t('configuracoes.assinatura.mensal').replace('📅 ', '') : t('configuracoes.assinatura.anual').replace('📆 ', '')}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">{t('configuracoes.assinatura.iniciadoEm')}</span>
                            <span className="ml-1 font-medium">
                              {new Date(subscriptionData.start_time).toLocaleDateString(lang === 'pt' ? 'pt-PT' : 'en-US')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Botão para carregar dados detalhados se ainda não foram carregados */}
                    {!subscriptionData && !loadingSubscription && (dadosUsuario?.paypalSubscriptionId || dadosUsuario?.subscriptionID) && (
                      <button
                        onClick={carregarDadosAssinatura}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-xs font-medium transition-colors mb-3"
                      >
                        {t('configuracoes.assinatura.verDetalhesAssinatura')}
                      </button>
                    )}
                    
                    {loadingSubscription && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-blue-600">{t('configuracoes.assinatura.carregandoDetalhes')}</span>
                      </div>
                    )}
                    
                    {/* Botão de cancelamento */}
                    <button
                      onClick={() => setShowCancelConfirmation(true)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                      disabled={cancellingSubscription}
                    >
                      {cancellingSubscription ? t('configuracoes.assinatura.cancelando') : t('configuracoes.assinatura.cancelarAssinatura')}
                    </button>
                  </div>
                )}

                {dadosUsuario?.subscriptionStatus === 'premium_free' && (                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">                    <h3 className="font-medium text-green-800 mb-2">{t('configuracoes.assinatura.acessoPremiumGratuito')}</h3>                    <p className="text-sm text-green-600">
                      {t('configuracoes.assinatura.acessoPermanente')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Código de Cupão */}
        {!dadosUsuario?.hasSecretCode && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-[#7B4BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <span>{t('configuracoes.cupom.titulo')}</span>
            </h2>
            
            <div className="space-y-4">              <p className="text-gray-600 text-sm">
                {t('configuracoes.cupom.temCodigo')}
              </p>
              
              {!mostrarFormularioCodigo ? (
                <button
                  onClick={() => setMostrarFormularioCodigo(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-[1.02] flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  <span>{t('configuracoes.cupom.tenhoCodigoCupao')}</span>
                </button>
              ) : (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>                    <label htmlFor="codigoCupom" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('configuracoes.cupom.codigoCupao')}
                    </label>                    <input
                      type="text"
                      id="codigoCupom"
                      value={codigoCupom}
                      onChange={(e) => setCodigoCupom(e.target.value)}
                      placeholder={t('configuracoes.cupom.inserirCodigo')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent"
                      disabled={aplicandoCodigo}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleAplicarCodigo}
                      disabled={aplicandoCodigo || !codigoCupom.trim()}
                      className="flex-1 bg-gradient-to-r from-[#2A3F9E] to-[#7B4BFF] hover:shadow-lg text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {aplicandoCodigo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t('configuracoes.cupom.aplicandoCodigo')}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>{t('configuracoes.cupom.aplicarCodigo')}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setMostrarFormularioCodigo(false);
                        setCodigoCupom("");
                        setError("");
                      }}
                      disabled={aplicandoCodigo}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('configuracoes.cupom.cancelar')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}        {/* Feedback visual */}
        {(error || success) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className={`text-center ${error ? "text-red-600" : "text-green-600"}`}>
              {error && (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de confirmação de cancelamento de assinatura */}
        {showCancelConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-700">{t('configuracoes.assinatura.cancelarAssinaturaTitulo')}</h3>
                <button 
                  onClick={() => setShowCancelConfirmation(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={cancellingSubscription}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>                    <p className="text-yellow-800 font-medium mb-1">{t('configuracoes.assinatura.temCerteza')}</p>
                    <p className="text-yellow-700 text-sm">
                      {t('configuracoes.assinatura.cancelarDescricao')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowCancelConfirmation(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
                  disabled={cancellingSubscription}
                >
                  {t('configuracoes.assinatura.manterAssinatura')}
                </button>
                <button 
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2" 
                  disabled={cancellingSubscription}
                >
                  {cancellingSubscription ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t('configuracoes.assinatura.cancelando')}</span>
                    </>
                  ) : (
                    <span>{t('configuracoes.assinatura.simCancelar')}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
