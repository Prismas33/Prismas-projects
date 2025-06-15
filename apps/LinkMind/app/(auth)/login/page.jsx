"use client";
import { useState, useEffect } from "react";
import { loginUtilizador } from "../../../lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-10 flex flex-col items-center border border-gray-100">
          <img src="/vector.png" alt="LinkMind Logo" className="w-12 h-12 mb-2" />
          <h1 className="text-xl font-bold text-[#181F3A] mb-1 tracking-tight">LinkMind</h1>
          <p className="text-gray-500 mb-6 text-sm">Entre na sua conta</p>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#181F3A] mb-1">E-mail</label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent bg-gray-50 text-gray-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#181F3A] mb-1">Senha</label>
              <input
                type="password"
                placeholder="Digite sua senha"
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
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>
          <div className="flex justify-between w-full mt-6 text-xs text-gray-500">
            <Link href="/registo" className="hover:text-[#7B4BFF] transition-colors">Criar nova conta</Link>
            <button className="hover:text-[#7B4BFF] transition-colors" disabled>Entrar com Google</button>
          </div>
        </div>
      </div>
    </div>
  );
}
