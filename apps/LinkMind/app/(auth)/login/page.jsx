"use client";
import { useState, useEffect } from "react";
import { loginUtilizador } from "../../../lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/context/AuthContext";
import Link from "next/link";
import { useI18n } from "../../../lib/context/I18nContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7B4BFF]"></div>
      </div>
    );
  }

  // Se usuário já está logado, não mostrar a página de login
  if (user) {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await loginUtilizador(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#2A3F9E]">{t('login')}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#181F3A] mb-1">Email</label>
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent bg-gray-50 text-gray-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#181F3A] mb-1">{t('password') || 'Senha'}</label>
            <input
              type="password"
              placeholder={t('enter_password') || 'Digite sua senha'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent bg-gray-50 text-gray-900 transition-all"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7B4BFF] hover:bg-[#2A3F9E] text-white p-3 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t('logging_in') || 'A entrar...' : t('login')}
          </button>
        </form>
        <div className="flex justify-between w-full mt-6 text-xs text-gray-500">
          <Link href="/registo" className="hover:text-[#7B4BFF] transition-colors">{t('create_account') || 'Criar nova conta'}</Link>
          <button className="hover:text-[#7B4BFF] transition-colors" disabled>{t('login_with_google') || 'Entrar com Google'}</button>
        </div>
      </div>
    </div>
  );
}
