"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../lib/context/AuthContext";
import { useI18n } from "../../lib/context/I18nContext";
import { useRouter } from "next/navigation";
import { verificarAcessoPremium } from "../../lib/firebase/auth";
import { nomeParaIdFirestore } from "../../lib/firebase/utils";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const planIds = {
    monthly: process.env.NEXT_PUBLIC_PAYPAL_MONTHLY_PLAN_ID || "P-2S058014PP6652810NBLHD2A",
    annual: process.env.NEXT_PUBLIC_PAYPAL_ANNUAL_PLAN_ID || "P-1Y572463M65637718NBLHETI"
  };
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "ASW3a4x9be9lfHENHHj4VsVsVcTFbFa_IuZYD3EiO1l3LCJYMtltBx6ouuI_Wm_kTSXz6GFT16aqngzh";  const plans = {
    monthly: {
      id: planIds.monthly,
      name: t('configuracoes.subscriptionPage.planoMensal'),
      price: t('configuracoes.subscriptionPage.preco5'),
      period: t('configuracoes.subscriptionPage.porMes'),
      description: t('configuracoes.subscriptionPage.descricaoMensal'),
      savings: null
    },
    annual: {
      id: planIds.annual,
      name: t('configuracoes.subscriptionPage.planoAnual'),
      price: t('configuracoes.subscriptionPage.preco50'),
      period: t('configuracoes.subscriptionPage.porAno'),
      description: t('configuracoes.subscriptionPage.descricaoAnual'),
      savings: t('configuracoes.subscriptionPage.economize')
    }
  };const checkUserAccess = useCallback(async () => {
    if (!user?.displayName || checkingAccess) return;
    
    setCheckingAccess(true);
    setLoading(true);
    try {
      const nomeId = nomeParaIdFirestore(user.displayName);
      const status = await verificarAcessoPremium(nomeId);
      setAccessStatus(status);
      
      // Se já tem acesso premium, redirecionar para dashboard
      if (status.hasAccess && status.reason !== 'trial_active') {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [user?.displayName, checkingAccess, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && !accessStatus && !checkingAccess) {
      checkUserAccess();
    }
  }, [user, authLoading, accessStatus, checkingAccess, checkUserAccess]);

  const handlePayPalSuccess = async (data) => {
    try {
      const response = await fetch('/api/paypal/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionID: data.subscriptionID,
          planType: selectedPlan,
          userDisplayName: user.displayName
        })
      });      if (response.ok) {
        alert(t('configuracoes.subscriptionPage.assinaturaAtivada'));
        router.push('/dashboard');
      } else {
        alert(t('configuracoes.subscriptionPage.erroAtivarAssinatura'));
      }
    } catch (error) {
      console.error("Erro ao processar assinatura:", error);
      alert(t('configuracoes.subscriptionPage.erroProcessarAssinatura'));
    }
  };
  if (authLoading || loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7B4BFF]"></div>
      </div>
    );
  }

  // Se tem acesso permanente, mostrar status
  if (accessStatus?.hasAccess && accessStatus.reason !== 'trial_active') {
    return (      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>          <h1 className="text-2xl font-bold text-[#2A3F9E] mb-4">{t('configuracoes.subscriptionPage.premiumAtivo')}</h1>
          <p className="text-gray-600 mb-6">
            {accessStatus.reason === 'secret_code' 
              ? t('configuracoes.subscriptionPage.codigoEspecial')
              : t('configuracoes.subscriptionPage.subscricaoPaypal')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-[#2A3F9E] to-[#7B4BFF] text-white p-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all"
          >
            {t('configuracoes.subscriptionPage.irDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const trialDaysLeft = accessStatus?.reason === 'trial_active' 
    ? Math.ceil((new Date(accessStatus.trialEnd) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-12">
      <div className="max-w-4xl mx-auto px-4">        <div className="text-center mb-12">          <h1 className="text-4xl font-bold text-[#2A3F9E] mb-4">
            {t('configuracoes.subscriptionPage.titulo')}
          </h1>
          {accessStatus?.reason === 'trial_active' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700">
                🎉 {t('configuracoes.subscriptionPage.trialDias')} <strong>{trialDaysLeft} {t('configuracoes.subscriptionPage.dias')}</strong> {t('configuracoes.subscriptionPage.trialAtivo')}
                <br />
                {t('configuracoes.subscriptionPage.assineAgora')}
              </p>
            </div>
          )}
          <p className="text-gray-600 text-lg">
            {t('configuracoes.subscriptionPage.acessoCompleto')}
          </p>
        </div>

        {/* Seletor de Planos */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedPlan === 'monthly'
                  ? 'bg-[#7B4BFF] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#7B4BFF]'
              }`}
            >              {t('configuracoes.subscriptionPage.mensal')}
            </button>
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedPlan === 'annual'
                  ? 'bg-[#7B4BFF] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#7B4BFF]'
              }`}
            >
              {t('configuracoes.subscriptionPage.anual')}
            </button>
          </div>
        </div>

        {/* Card do Plano Selecionado */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#7B4BFF]">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#2A3F9E] mb-2">
                {plans[selectedPlan].name}
              </h3>
              <div className="text-4xl font-bold text-[#7B4BFF] mb-2">
                {plans[selectedPlan].price}
                <span className="text-lg text-gray-500">{plans[selectedPlan].period}</span>
              </div>
              {plans[selectedPlan].savings && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {plans[selectedPlan].savings}
                </div>
              )}
              <p className="text-gray-600 mt-4">{plans[selectedPlan].description}</p>
            </div>            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">{t('configuracoes.subscriptionPage.incluido')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('configuracoes.subscriptionPage.uploadIlimitado')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('configuracoes.subscriptionPage.organizacaoIdeias')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('configuracoes.subscriptionPage.acessoCompletoSistema')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('configuracoes.subscriptionPage.suportePrioritario')}
                </li>
              </ul>
            </div>

            {/* Botão PayPal */}
            <PayPalScriptProvider options={{ 
              "client-id": "ASW3a4x9be9lfHENHHj4VsVsVcTFbFa_IuZYD3EiO1l3LCJYMtltBx6ouuI_Wm_kTSXz6GFT16aqngzh",
              vault: true,
              intent: "subscription"
            }}>
              <PayPalButtons
                style={{
                  shape: selectedPlan === 'monthly' ? 'pill' : 'rect',
                  color: 'blue',
                  layout: 'vertical',
                  label: 'subscribe'
                }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: plans[selectedPlan].id
                  });
                }}
                onApprove={handlePayPalSuccess}                onError={(err) => {
                  console.error("Erro PayPal:", err);
                  alert(t('configuracoes.subscriptionPage.erroProcessarPagamento'));
                }}
              />
            </PayPalScriptProvider>            <p className="text-xs text-gray-500 text-center mt-4">
              {t('configuracoes.subscriptionPage.cancelarQualquerMomento')}
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#7B4BFF] hover:underline"
          >
            {t('configuracoes.subscriptionPage.voltarDashboard')}
          </button>
        </div>
      </div>
    </div>
  );
}
