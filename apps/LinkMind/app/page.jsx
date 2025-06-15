"use client";
import Link from "next/link";
import { useAuth } from "../lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUtilizador, obterDadosUtilizador } from "../lib/firebase/auth";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [nome, setNome] = useState("");  const [logoutLoading, setLogoutLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    async function fetchNome() {
      if (user) {
        try {
          const dados = await obterDadosUtilizador(user.uid);
          setNome(dados?.nome || user.displayName || "");
        } catch {
          setNome(user.displayName || "");
        }
      } else {
        setNome("");
      }
    }
    if (mounted && !loading) fetchNome();
  }, [user, loading, mounted]);  // Separate effect for navigation to avoid hydration issues
  useEffect(() => {
    if (mounted && !loading && user && !redirecting) {
      setRedirecting(true);
      // Use a shorter timeout 
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, loading, mounted, router, redirecting]);
  // Don't render interactive content until mounted
  if (!mounted || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show loading if user is authenticated and redirecting
  if (user && redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-white text-lg">A redirecionar para o dashboard...</p>
      </div>
    );
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await logoutUtilizador();
      router.push("/");
    } catch {}
    setLogoutLoading(false);
  }  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'rgba(123, 75, 255, 0.2)',
          filter: 'blur(100px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'rgba(255, 215, 0, 0.1)',
          filter: 'blur(100px)'
        }}></div>
      </div>
      
      {/* Loading Overlay */}
      {mounted && loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-[#0f172a]/60">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#7B4BFF]"></div>
        </div>
      )}
      
      {/* Header/Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12 backdrop-blur-md bg-black/10">
        <div className="flex items-center gap-3">
          <img
            src="/vector.png"
            alt="LinkMind Logo"
            className="w-10 h-10 drop-shadow-lg"
          />
          <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#7B4BFF] to-[#FFD700]">
            LinkMind
          </span>
        </div>
        {user && nome ? (
          <div className="flex items-center gap-4">
            <span className="text-white/90 font-medium">Bem-vindo, {nome}!</span>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#7B4BFF] to-[#6C2BFF] text-white shadow-lg transition-all disabled:opacity-60"
            >
              {logoutLoading ? "A sair..." : "Logout"}
            </button>
          </div>
        ) : (
          <></>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 lg:py-24 z-10">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6 text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#7B4BFF] to-[#FFD700]">
              As tuas ideias, conectadas ao futuro
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Organiza, pesquisa e evolui as tuas ideias de forma visual, intuitiva e sempre acessível. Experimenta a nova era da criatividade digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/registo"
                className="rounded-full px-6 py-3 text-base font-semibold bg-gradient-to-r from-[#7B4BFF] to-[#6C2BFF] hover:from-[#8B5AFF] hover:to-[#7C3BFF] text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                🚀 Começar Agora
              </Link>
              <Link
                href="/login"
                className="rounded-full px-6 py-3 text-base font-semibold bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/90 hover:text-white border border-white/10 shadow-lg hover:shadow-xl transition-all"
              >
                Iniciar Sessão
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <img
              src="/vector.png"
              alt="LinkMind Ilustração"
              className="w-64 h-64 object-contain animate-float"
              style={{
                filter: 'drop-shadow(0 0 32px #bdbdbd88) drop-shadow(0 0 8px #fff4)',
                background: 'none'
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-16 lg:px-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#7B4BFF]">
          Funcionalidades Poderosas
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-[#7B4BFF]/80 to-[#6C2BFF]/80 mb-6 shadow-lg mx-auto">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L8 8M8 8L11 11M8 8H15C16.1046 8 17 8.89543 17 10V16M17 19L14 16M14 16L17 13M14 16H19C20.1046 16 21 15.1046 21 14V5" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-[#7B4BFF]">
              Organização Visual
            </h3>
            <p className="text-white/70 text-center">
              Arrasta, categoriza e liga ideias com facilidade num ambiente visual e intuitivo.
            </p>
          </div>
          
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-[#FFD700]/80 to-[#FFA500]/80 mb-6 shadow-lg mx-auto">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.6 9h16.8M3.6 15h16.8"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3a4.5 4.5 0 0 0 0 18 4.5 4.5 0 0 0 0-18z" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FFD700]">
              Acesso Universal
            </h3>
            <p className="text-white/70 text-center">
              PWA: Usa no computador ou telemóvel, mesmo offline. As tuas ideias sempre disponíveis.
            </p>
          </div>
          
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-[#7B4BFF]/80 to-[#FFD700]/80 mb-6 shadow-lg mx-auto">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 15.5L19 19M5 11a6 6 0 1 0 12 0 6 6 0 0 0-12 0z" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#7B4BFF] to-[#FFD700]">
              Pesquisa Inteligente
            </h3>
            <p className="text-white/70 text-center">
              Encontra rapidamente qualquer ideia usando filtros, etiquetas e inteligência contextual.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto backdrop-blur-lg bg-gradient-to-br from-[#7B4BFF]/20 to-[#FFD700]/10 rounded-3xl p-8 lg:p-12 border border-white/10 shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-6 text-white">
            Começa a organizar as tuas ideias hoje
          </h2>
          <p className="text-white/70 text-center mb-8 max-w-xl mx-auto">
            Junta-te a milhares de criativos que já transformaram as suas ideias em projectos reais.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/registo"
              className="rounded-full px-8 py-4 text-base font-semibold bg-gradient-to-r from-[#7B4BFF] to-[#6C2BFF] hover:from-[#8B5AFF] hover:to-[#7C3BFF] text-white shadow-lg hover:shadow-xl transition-all text-center"
            >
              Criar Conta Grátis
            </Link>
            <Link
              href="/login"
              className="rounded-full px-8 py-4 text-base font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 shadow-lg hover:shadow-xl transition-all text-center"
            >
              Iniciar Sessão
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/60 text-sm backdrop-blur-sm bg-black/20">
        <div className="max-w-6xl mx-auto px-6">          <span>
            © {new Date().getFullYear()} LinkMind. Todos os direitos reservados.
          </span>        </div>
      </footer>
    </main>
  );
}
