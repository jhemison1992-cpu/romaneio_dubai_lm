# Arquitetura da Plataforma SaaS - Romaneio de Liberação

## Visão Geral

Transformação do sistema de Romaneio de Liberação em uma plataforma SaaS multi-empresa (multi-tenant) onde:

- **Cada empresa** tem seus próprios dados isolados
- **Usuários** podem pertencer a múltiplas empresas com diferentes papéis
- **Planos de assinatura** controlam funcionalidades disponíveis
- **Dashboard administrativo** para gerenciar empresas e usuários
- **ALUMINC** é o cliente de referência/demo

---

## 1. Modelo de Dados Multi-Tenant

### Tabelas Principais

```
companies
├── id (PK)
├── name
├── slug (único, para URL)
├── logo_url
├── subscription_plan (free, pro, enterprise)
├── subscription_status (active, paused, cancelled)
├── subscription_end_date
├── created_at
├── updated_at

company_users
├── id (PK)
├── company_id (FK)
├── user_id (FK)
├── role (admin, supervisor, technician, viewer)
├── created_at

users (estendido)
├── id (PK)
├── email
├── name
├── avatar_url
├── created_at
├── updated_at

inspections (estendido)
├── id (PK)
├── company_id (FK) ← NOVO
├── title
├── status
├── created_at
├── updated_at

inspection_items (estendido)
├── id (PK)
├── inspection_id (FK)
├── company_id (FK) ← NOVO (para queries rápidas)
├── environment_id
├── release_date
├── created_at
├── updated_at
```

---

## 2. Fluxo de Autenticação

### Registro de Empresa

1. Novo usuário acessa `/signup`
2. Preenche: email, senha, nome da empresa
3. Sistema cria:
   - Nova `company` (plano free)
   - Novo `user` (role: admin)
   - Novo `company_user` (admin da empresa)
4. Usuário é redirecionado para `/dashboard`

### Login

1. Usuário faz login com email/senha
2. Sistema retorna lista de empresas do usuário
3. Usuário seleciona empresa (ou usa última usada)
4. Session cookie inclui `companyId` + `userId`

### Isolamento de Dados

- Toda query filtra por `company_id` do usuário
- Middleware valida `company_id` em cada requisição
- Usuário não pode acessar dados de outras empresas

---

## 3. Controle de Permissões (RBAC)

### Papéis

| Papel | Criar | Editar | Deletar | Gerenciar Usuários | Acessar Admin |
|-------|-------|--------|---------|-------------------|---------------|
| **admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **supervisor** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **technician** | ✅ | ✅ (próprios) | ❌ | ❌ | ❌ |
| **viewer** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Planos de Assinatura

### Free
- Até 1 obra
- Até 3 usuários
- Sem suporte prioritário

### Pro
- Até 10 obras
- Até 20 usuários
- Suporte por email
- Relatórios básicos

### Enterprise
- Ilimitado
- Suporte prioritário
- Relatórios avançados
- API customizada

---

## 5. Estrutura de URLs

```
/                           → Landing page (público)
/signup                     → Registro de empresa
/login                      → Login
/dashboard                  → Dashboard da empresa
/dashboard/inspections      → Lista de vistorias
/dashboard/inspections/:id  → Detalhe da vistoria
/dashboard/users            → Gerenciar usuários
/dashboard/settings         → Configurações da empresa
/admin                      → Dashboard administrativo (admin only)
/admin/companies            → Gerenciar empresas
/admin/billing              → Gerenciar faturas
```

---

## 6. Integração Stripe

### Webhook Events
- `customer.subscription.created` → Ativar plano
- `customer.subscription.updated` → Atualizar plano
- `customer.subscription.deleted` → Cancelar plano
- `invoice.payment_failed` → Notificar empresa

### Fluxo de Checkout
1. Admin clica "Upgrade Plan"
2. Redireciona para Stripe Checkout
3. Após pagamento, Stripe envia webhook
4. Sistema atualiza `subscription_plan` e `subscription_end_date`

---

## 7. Migração de Dados da ALUMINC

### Processo
1. Criar `company` para ALUMINC
2. Copiar todas as `inspections` e `inspection_items` existentes
3. Adicionar `company_id` aos registros
4. Criar `company_user` para usuários existentes

### Dados Preservados
- Todas as vistorias
- Todos os ambientes
- Fotos e vídeos
- Histórico de alterações

---

## 8. Implementação Técnica

### Backend (tRPC Procedures)

```typescript
// Autenticação
auth.signup()
auth.login()
auth.logout()

// Empresas
companies.create()
companies.getBySlug()
companies.update()
companies.delete()

// Usuários da Empresa
companyUsers.invite()
companyUsers.list()
companyUsers.updateRole()
companyUsers.remove()

// Vistorias (com isolamento)
inspections.list()      // Filtra por company_id
inspections.create()    // Associa company_id
inspections.update()    // Valida company_id
inspections.delete()    // Valida company_id

// Admin
admin.companies.list()
admin.companies.getStats()
admin.billing.listInvoices()
```

### Frontend (Páginas)

```
/src/pages/
├── Auth.tsx              → Signup/Login
├── Dashboard.tsx         → Home da empresa
├── Inspections.tsx       → Lista de vistorias
├── InspectionDetail.tsx  → Detalhe (já existe)
├── Users.tsx             → Gerenciar usuários
├── Settings.tsx          → Configurações
└── Admin/
    ├── Companies.tsx     → Gerenciar empresas
    └── Billing.tsx       → Faturas
```

---

## 9. Segurança

### Princípios
- **Row-Level Security**: Toda query filtra por `company_id`
- **Validação de Permissões**: Middleware valida role do usuário
- **Isolamento de Dados**: Usuário não pode ver dados de outras empresas
- **Auditoria**: Log de todas as alterações

### Middleware de Contexto

```typescript
// Validar que user pertence à company
if (!userCompanies.includes(companyId)) {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

---

## 10. Roadmap de Implementação

### Fase 1: Fundação (Semana 1-2)
- [ ] Estender schema com `companies` e `company_users`
- [ ] Implementar autenticação multi-empresa
- [ ] Criar middleware de isolamento

### Fase 2: Interface (Semana 3-4)
- [ ] Dashboard de empresa
- [ ] Gerenciamento de usuários
- [ ] Página de configurações

### Fase 3: Admin (Semana 5)
- [ ] Dashboard administrativo
- [ ] Gerenciamento de empresas

### Fase 4: Pagamentos (Semana 6)
- [ ] Integração Stripe
- [ ] Webhooks de assinatura

### Fase 5: Migração (Semana 7)
- [ ] Migrar dados da ALUMINC
- [ ] Testes de integridade

---

## Próximos Passos

1. ✅ Revisar e aprovar arquitetura
2. ⏳ Estender schema do banco de dados
3. ⏳ Implementar autenticação multi-empresa
4. ⏳ Criar interface de dashboard
5. ⏳ Integrar Stripe
