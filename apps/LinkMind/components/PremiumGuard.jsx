"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/context/AuthContext";
import { checkPremiumAccess } from "../lib/utils/accessGuard";
import Link from "next/link";

export default function PremiumGuard({ children, showMessage = true }) {
  const { user, loading: authLoading } = useAuth();
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!authLoading && user) {
        const status = await checkPremiumAccess(user);
        setAccessStatus(status);
        setLoading(false);
      } else if (!authLoading && !user) {
        setLoading(false);
      }
    }

    checkAccess();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7B4BFF]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login">
            <button className="bg-[#7B4BFF] hover:bg-[#6A3EEE] text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Fazer Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!accessStatus?.hasAccess) {
    if (!showMessage) {
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Premium Necessário</h2>
          <p className="text-gray-600 mb-6">
            {accessStatus?.type === 'expired' 
              ? 'Seu trial expirou. Para continuar usando esta funcionalidade, assine um dos nossos planos.'
              : 'Esta funcionalidade requer uma assinatura premium.'}
          </p>
          <div className="space-y-3">
            <Link href="/subscription">
              <button className="w-full bg-[#7B4BFF] hover:bg-[#6A3EEE] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Ver Planos - A partir de €5/mês
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                Voltar ao Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
