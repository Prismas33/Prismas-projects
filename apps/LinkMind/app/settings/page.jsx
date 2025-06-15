"use client";
import { useAuth } from "../../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { trocarSenha, excluirConta, logoutUtilizador, obterDadosUtilizador, atualizarFotoPerfil } from "../../lib/firebase/auth";
import { uploadArquivo } from "../../lib/firebase/storage";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import Link from "next/link";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      carregarDadosUsuario();
    }
  }, [user, authLoading, router]);

  async function carregarDadosUsuario() {
    if (!user) return;
    try {
      setCarregandoDados(true);
      const nomeId = nomeParaIdFirestore(user.displayName || "");
      const dados = await obterDadosUtilizador(nomeId);
      setDadosUsuario(dados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregandoDados(false);
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
    setSuccess("");
    try {
      await trocarSenha(novaSenha);
      setSuccess("Senha alterada com sucesso!");
      setShowChangePass(false);
      setNovaSenha("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluirConta() {
    setLoading(true);
    setError("");
    try {
      await excluirConta();
      await logoutUtilizador();
      router.push("/login");
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
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }    setUploadingFoto(true);
    setError("");
    try {
      const fotoUrl = await uploadArquivo(user.uid, file);
      const nomeId = nomeParaIdFirestore(user.displayName || "");
      await atualizarFotoPerfil(nomeId, fotoUrl);
      setDadosUsuario(prev => ({ ...prev, fotoPerfil: fotoUrl }));
      setSuccess("Foto de perfil atualizada com sucesso!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingFoto(false);
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
              <h1 className="text-2xl font-bold text-gray-800">Configurações da Conta</h1>
              <p className="text-gray-600">Gerir as suas preferências e conta</p>
            </div>
          </div>        </div>        {/* Informações pessoais */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#7B4BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Informações Pessoais</span>
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
                    {dadosUsuario?.fotoPerfil ? 'Alterar foto' : 'Adicionar foto'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFotoUpload}
                      className="hidden"
                      disabled={uploadingFoto}
                    />
                  </label>
                  <p className="text-xs text-gray-500">JPG, PNG ou GIF (máx. 5MB)</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {user.displayName || dadosUsuario?.nome || "Não informado"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provedor de Login</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email/Senha'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Membro desde</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                    {dadosUsuario?.criadoEm?.toDate?.()?.toLocaleDateString('pt-PT') || 
                     user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-PT') : 
                     "Data não disponível"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total de Ideias</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800">
                  {dadosUsuario?.ideias?.length || 0} ideias guardadas
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
            <span>Configurações de Segurança</span>
          </h2>
          <div className="space-y-4">
            {/* Mostrar opção de criar senha apenas para usuários do Google */}
            {user.providerData?.[0]?.providerId === 'google.com' && (
              <button 
                className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-md"
                onClick={() => setShowChangePass(true)}
                disabled={loading}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Criar Senha</span>
                </div>
              </button>
            )}
            
            {/* Opção de trocar senha para usuários com email/senha */}
            {user.providerData?.[0]?.providerId !== 'google.com' && (
              <button 
                className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md"
                onClick={() => setShowChangePass(true)}
                disabled={loading}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-4a1 1 0 011-1h3l2.257-2.257A6 6 0 0121 9z" />
                  </svg>
                  <span>Trocar Senha</span>
                </div>
              </button>
            )}
            
            <button 
              className="w-full py-3 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-all transform hover:scale-105 shadow-md"
              onClick={() => setShowDelete(true)}
              disabled={loading}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Excluir Conta</span>
              </div>
            </button>
          </div>
        </div>

        {/* Outras opções */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#7B4BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Outras Opções</span>
          </h2>
          <div className="space-y-3">
            <button 
              className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-left"
              onClick={() => alert('Funcionalidade em breve!')}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exportar todas as ideias</span>
              </div>
            </button>
            
            <button 
              className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-left"
              onClick={() => alert('Funcionalidade em breve!')}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Partilhar perfil público</span>
              </div>
            </button>
            
            <button 
              className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-left"
              onClick={() => alert('Funcionalidade em breve!')}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5l-5-5h5v-5z" />
                </svg>
                <span>Backup automático</span>
              </div>
            </button>
          </div>
        </div>        {/* Formulário de troca de senha */}
        {showChangePass && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {user.providerData?.[0]?.providerId === 'google.com' ? 'Criar Senha' : 'Trocar Senha'}
            </h3>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-blue-700 text-sm">
                {user.providerData?.[0]?.providerId === 'google.com' 
                  ? 'Criar uma senha permitirá que faça login com email/senha além do Google.'
                  : 'A sua nova senha deve ter pelo menos 6 caracteres.'}
              </p>
            </div>
            <form onSubmit={handleTrocarSenha} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nova Senha</label>
                <input 
                  type="password" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all" 
                  value={novaSenha} 
                  onChange={e => setNovaSenha(e.target.value)} 
                  required 
                  minLength={6} 
                  disabled={loading}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
                  onClick={() => setShowChangePass(false)} 
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50" 
                  disabled={loading || novaSenha.length < 6}
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Confirmação de exclusão */}
        {showDelete && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-red-700 mb-4">⚠️ Excluir Conta</h3>
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="text-red-700">
                <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados, incluindo ideias e configurações, serão permanentemente removidos.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" 
                onClick={() => setShowDelete(false)} 
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50" 
                onClick={handleExcluirConta} 
                disabled={loading}
              >
                {loading ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        )}

        {/* Feedback visual */}
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
      </div>
    </div>
  );
}
