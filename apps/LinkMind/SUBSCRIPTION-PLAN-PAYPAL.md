# Como implementar planos de subscrição mensal e anual com PayPal (Next.js)

## 1. Criar Conta PayPal Business
- Crie uma conta PayPal Business em https://www.paypal.com/business.
- Acesse o painel de desenvolvedor: https://developer.paypal.com/
- Crie um app para obter Client ID e Secret (sandbox e live).

## 2. Criar Produtos e Planos no PayPal
- No painel PayPal, acesse "Products & Services" > "Subscriptions".
- Crie dois produtos: "Plano Mensal" e "Plano Anual".
- Para cada produto, crie um plano de pagamento recorrente (mensal e anual).
- Guarde os IDs dos planos (plan_id) para uso na integração.

## 3. Integração Frontend (Next.js)
- Instale o SDK PayPal JS: `npm install @paypal/react-paypal-js`
- Adicione o botão PayPal na página de pagamento:

```jsx
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

<PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
  <PayPalButtons
    createSubscription={(data, actions) => {
      return actions.subscription.create({
        plan_id: "PAYPAL_PLAN_ID" // Mensal ou anual
      });
    }}
    onApprove={(data, actions) => {
      // Chame sua API para registrar a subscrição
      // data.subscriptionID
    }}
  />
</PayPalScriptProvider>
```
- Permita o usuário escolher entre mensal/anual e use o respectivo `plan_id`.

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
