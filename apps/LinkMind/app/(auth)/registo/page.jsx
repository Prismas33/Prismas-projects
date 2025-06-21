"use client";
import { useState, useEffect } from "react";
import { registarUtilizador } from "../../../lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/context/AuthContext";
import Link from "next/link";
import { useI18n } from "../../../lib/context/I18nContext";

export default function RegistoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessPass, setAccessPass] = useState("");  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('pt');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t, setLang: setGlobalLang } = useI18n();

  // Inicializar idioma do localStorage após montar componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('lang');
      if (savedLang) {
        setLang(savedLang);
      }
    }
  }, []);

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

  // Se usuário já está logado, não mostrar a página de registo
  if (user) {
    return null;
  }  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError(t('passwords_do_not_match') || "Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError(t('password_min_length') || "Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      // Passar o código de acesso para a função de registro
      await registarUtilizador(email, password, nome, accessPass || null);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    localStorage.setItem('lang', lang);
    setGlobalLang(lang);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#2A3F9E]">{t('register')}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seletor de idioma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('language') || 'Idioma'}</label>
            <select
              value={lang}
              onChange={e => {
                setLang(e.target.value);
                localStorage.setItem('lang', e.target.value);
                setGlobalLang(e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name') || 'Nome'}</label>
            <input
              type="text"
              placeholder={t('name') || 'Nome'}
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password') || 'Password'}</label>
            <input
              type="password"
              placeholder={t('password') || 'Password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password') || 'Confirmar Password'}</label>
            <input
              type="password"
              placeholder={t('confirm_password') || 'Repita a sua password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('access_code_optional')}</label>
            <input
              type="text"
              placeholder={t('access_code_placeholder')}
              value={accessPass}
              onChange={e => setAccessPass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />            <p className="text-xs text-gray-500 mt-1">
              {t('trial_message')}
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2A3F9E] to-[#7B4BFF] text-white p-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('creating_account') || 'A criar conta...' : t('register')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t('already_have_account') || 'Já tem conta?'}{" "}
            <Link href="/login" className="text-[#7B4BFF] font-medium hover:underline">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
