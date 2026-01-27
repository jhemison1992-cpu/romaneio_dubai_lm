# Integração Stripe - Guia Completo

## Visão Geral

A integração Stripe foi implementada para permitir que clientes assinem planos de preço diretamente pela plataforma. O sistema suporta:

- ✅ Checkout de subscrição com Stripe
- ✅ Webhooks para sincronizar eventos de pagamento
- ✅ Gerenciamento de subscrições (upgrade, downgrade, cancelamento)
- ✅ Histórico de faturas
- ✅ Portal de gerenciamento do cliente

## Arquitetura

### Backend

#### Arquivos principais:
- `server/stripe-helpers.ts` - Helpers para criar sessões de checkout e gerenciar subscrições
- `server/stripe-routes.ts` - Rotas Express para webhook do Stripe
- `server/stripe-webhook.ts` - Processamento de eventos do Stripe
- `server/db-stripe.ts` - Operações de banco de dados relacionadas ao Stripe
- `server/subscriptions-router.ts` - Procedimentos tRPC para subscrições

#### Procedimentos tRPC disponíveis:

```typescript
// Criar sessão de checkout
trpc.subscriptions.createCheckoutSession.useMutation({
  planSlug: "pro" | "enterprise" | "basic",
  billingCycle: "monthly" | "annual",
  successUrl: string,
  cancelUrl: string
})

// Obter subscrição ativa
trpc.subscriptions.getActiveSubscription.useQuery({
  companyId: number
})

// Cancelar subscrição
trpc.subscriptions.cancelSubscription.useMutation({
  subscriptionId: number
})

// Obter URL do portal de gerenciamento
trpc.subscriptions.getCustomerPortalUrl.useMutation({
  returnUrl: string
})
```

### Frontend

#### Componentes principais:
- `client/src/pages/Pricing.tsx` - Página de planos com botões de checkout
- `client/src/pages/Billing.tsx` - Página de gerenciamento de faturamento
- `client/src/pages/BillingSuccess.tsx` - Página de sucesso após checkout

## Fluxo de Checkout

1. **Usuário clica em "Começar Agora"** na página de Pricing
2. **Sistema verifica autenticação** - se não autenticado, exibe alerta
3. **Cria sessão de checkout** via `trpc.subscriptions.createCheckoutSession`
4. **Abre Stripe Checkout** em nova aba
5. **Usuário completa pagamento** no Stripe
6. **Webhook processa evento** `checkout.session.completed`
7. **Sistema atualiza banco de dados** com informações de subscrição
8. **Usuário é redirecionado** para página de sucesso

## Webhooks

### Eventos processados:

| Evento | Ação |
|--------|------|
| `checkout.session.completed` | Cria subscrição no banco de dados |
| `customer.subscription.updated` | Atualiza status da subscrição |
| `customer.subscription.deleted` | Marca subscrição como cancelada |
| `invoice.paid` | Marca fatura como paga |
| `invoice.payment_failed` | Marca fatura como pendente |

### Configuração do webhook:

```
URL: /api/stripe/webhook
Método: POST
Eventos: checkout.session.completed, customer.subscription.*, invoice.*
```

## Variáveis de Ambiente

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Banco de Dados

### Tabelas principais:

#### `subscriptions`
```sql
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY,
  companyId INTEGER NOT NULL,
  stripeSubscriptionId TEXT NOT NULL,
  planSlug TEXT NOT NULL,
  status TEXT NOT NULL, -- active, paused, cancelled
  currentPeriodStart DATETIME,
  currentPeriodEnd DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `invoices`
```sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY,
  subscriptionId INTEGER,
  stripeInvoiceId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL, -- draft, open, paid, uncollectible, void
  paidAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `paymentMethods`
```sql
CREATE TABLE paymentMethods (
  id INTEGER PRIMARY KEY,
  companyId INTEGER NOT NULL,
  stripePaymentMethodId TEXT NOT NULL,
  type TEXT NOT NULL, -- card, bank_account
  isDefault BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Testes

### Cartões de teste do Stripe:

| Número | Resultado |
|--------|-----------|
| 4242 4242 4242 4242 | Sucesso |
| 4000 0000 0000 0002 | Falha de cartão |
| 4000 0025 0000 3155 | Autenticação 3D Secure |

### Testar webhook localmente:

```bash
# Usar Stripe CLI para redirecionar eventos
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Acionar evento de teste
stripe trigger checkout.session.completed
```

## Próximos Passos

1. **Implementar verificação de limites por plano** - Validar se empresa atingiu limite de recursos
2. **Adicionar período de teste gratuito** - Oferecer 14 dias grátis
3. **Implementar upgrade/downgrade** - Permitir mudança de plano
4. **Adicionar cupons de desconto** - Suportar códigos promocionais
5. **Integrar faturamento automático** - Enviar faturas por email automaticamente

## Troubleshooting

### Webhook não está sendo processado

1. Verificar se `STRIPE_WEBHOOK_SECRET` está correto
2. Verificar logs do servidor em `/api/stripe/webhook`
3. Testar webhook manualmente com Stripe CLI

### Checkout não abre

1. Verificar se `VITE_STRIPE_PUBLISHABLE_KEY` está correto
2. Verificar console do navegador para erros
3. Verificar se usuário está autenticado

### Subscrição não está sendo criada

1. Verificar se webhook está sendo recebido
2. Verificar logs do servidor
3. Verificar se banco de dados está acessível
4. Verificar se `companyId` está sendo passado corretamente nos metadados

## Referências

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Billing](https://stripe.com/docs/billing)
