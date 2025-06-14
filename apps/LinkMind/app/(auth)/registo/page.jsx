"use client";
import { useState } from "react";
import { registarUtilizador } from "../../../lib/firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("As passwords não coincidem");
      return;
    }
    
    if (password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres");
      return;
    }
    
    setLoading(true);
    try {
      await registarUtilizador(email, password, nome);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2A3F9E] to-[#7B4BFF] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="LinkMind Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#2A3F9E] mb-2">Criar Conta</h1>
          <p className="text-gray-600">Junte-se ao LinkMind e organize as suas ideias</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              type="text" 
              placeholder="O seu nome" 
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
              placeholder="o.seu.email@exemplo.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Password</label>
            <input 
              type="password" 
              placeholder="Repita a sua password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B4BFF] focus:border-transparent transition-all"
            />
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
            {loading ? "A criar conta..." : "Criar Conta"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem conta?{" "}
            <Link href="/login" className="text-[#7B4BFF] font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
