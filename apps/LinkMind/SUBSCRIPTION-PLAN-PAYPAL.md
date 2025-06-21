# Como implementar planos de subscrição mensal e anual com PayPal (Next.js)

## 1. Criar Conta PayPal Business
- Crie uma conta PayPal Business em https://www.paypal.com/business.
- Acesse o painel de desenvolvedor: https://developer.paypal.com/
- Crie um app para obter Client ID e Secret (sandbox e live).

## 2. Produtos e Planos Configurados
### Planos Criados:
- **Plano Mensal**: €5/mês - ID: `P-2S058014PP6652810NBLHD2A`
- **Plano Anual**: €50/ano - ID: `P-1Y572463M65637718NBLHETI`
- **Client ID**: `ASW3a4x9be9lfHENHHj4VsVsVcTFbFa_IuZYD3EiO1l3LCJYMtltBx6ouuI_Wm_kTSXz6GFT16aqngzh`

### Sistema de Acesso:
- **Trial**: 7 dias gratuitos após registro
- **Código de senha**: Acesso permanente gratuito se inserido no registro
- **Assinatura**: Necessária após trial (exceto usuários com código)

## 3. Integração Frontend (Next.js)
- Instale o SDK PayPal JS: `npm install @paypal/react-paypal-js`

### Exemplo com React PayPal JS:
```jsx
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const SubscriptionPlans = ({ selectedPlan }) => {
  const planIds = {
    monthly: "P-2S058014PP6652810NBLHD2A",
    annual: "P-1Y572463M65637718NBLHETI"
  };

  return (
    <PayPalScriptProvider options={{ 
      "client-id": "ASW3a4x9be9lfHENHHj4VsVsVcTFbFa_IuZYD3EiO1l3LCJYMtltBx6ouuI_Wm_kTSXz6GFT16aqngzh",
      vault: true,
      intent: "subscription"
    }}>
      <PayPalButtons
        style={{
          shape: selectedPlan === 'monthly' ? 'pill' : 'rect',
          color: 'silver',
          layout: 'vertical',
          label: 'subscribe'
        }}
        createSubscription={(data, actions) => {
          return actions.subscription.create({
            plan_id: planIds[selectedPlan]
          });
        }}
        onApprove={async (data, actions) => {
          // Registrar subscrição no backend
          const response = await fetch('/api/paypal/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              subscriptionID: data.subscriptionID,
              planType: selectedPlan
            })
          });
          
          if (response.ok) {
            alert('Subscrição ativada com sucesso!');
            window.location.href = '/dashboard';
          }
        }}
      />
    </PayPalScriptProvider>
  );
};
```

### Implementação HTML/JS Pura:
```html
<!-- Plano Mensal -->
<div id="paypal-button-container-monthly"></div>

<!-- Plano Anual -->
<div id="paypal-button-container-annual"></div>

<script src="https://www.paypal.com/sdk/js?client-id=ASW3a4x9be9lfHENHHj4VsVsVcTFbFa_IuZYD3EiO1l3LCJYMtltBx6ouuI_Wm_kTSXz6GFT16aqngzh&vault=true&intent=subscription"></script>
<script>
  // Plano Mensal
  paypal.Buttons({
    style: { shape: 'pill', color: 'silver', layout: 'vertical', label: 'subscribe' },
    createSubscription: function(data, actions) {
      return actions.subscription.create({ plan_id: 'P-2S058014PP6652810NBLHD2A' });
    },
    onApprove: function(data, actions) {
      // Registrar no backend
      fetch('/api/paypal/subscription', {
        method: 'POST',
        body: JSON.stringify({ subscriptionID: data.subscriptionID, planType: 'monthly' })
      });
    }
  }).render('#paypal-button-container-monthly');

  // Plano Anual
  paypal.Buttons({
    style: { shape: 'rect', color: 'silver', layout: 'vertical', label: 'subscribe' },
    createSubscription: function(data, actions) {
      return actions.subscription.create({ plan_id: 'P-1Y572463M65637718NBLHETI' });
    },
    onApprove: function(data, actions) {
      // Registrar no backend
      fetch('/api/paypal/subscription', {
        method: 'POST',
        body: JSON.stringify({ subscriptionID: data.subscriptionID, planType: 'annual' })
      });
    }
  }).render('#paypal-button-container-annual');
</script>
```

## 4. Backend: Validação e Controle de Acesso
- Crie um endpoint API (ex: `/api/paypal/webhook`) para receber webhooks do PayPal.
- No painel PayPal, configure o webhook para eventos de subscrição (ex: `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`).
- Quando receber um webhook de ativação, associe o `subscriptionID` ao usuário na sua base de dados.
- Sempre que o usuário acessar áreas restritas, valide se ele tem uma subscrição ativa (consultando sua base de dados ou a API do PayPal).

## 5. Exemplo de Validação de Acesso
- No login ou ao acessar páginas protegidas, verifique se o usuário tem uma subscrição ativa:
  - Consulte sua base de dados pelo `userId` e status da subscrição.
  - Opcional: consulte a API do PayPal para garantir que a subscrição está ativa.

## 6. Segurança
- Nunca confie apenas no frontend. Sempre valide o status da subscrição no backend.
- Use webhooks para manter o status atualizado (cancelamento, falha de pagamento, etc).

## 7. Referências
- [PayPal Subscriptions Docs](https://developer.paypal.com/docs/subscriptions/)
- [@paypal/react-paypal-js](https://www.npmjs.com/package/@paypal/react-paypal-js)
- [PayPal Webhooks](https://developer.paypal.com/docs/api/webhooks/v1/)

---

**Resumo:**
1. Crie produtos/planos no PayPal.
2. Implemente o botão de pagamento com o plano correto.
3. Use webhooks para validar e registrar subscrições.
4. Controle o acesso no backend, permitindo apenas usuários com subscrição ativa.
