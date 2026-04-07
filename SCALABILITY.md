# KwikRace: Estratégia de Fila e Escalabilidade

## 1. Pseudocódigo da Fila FIFO (Multi-Tenant)

A fila é gerida de forma independente para cada parceiro (`partner_id`).

```typescript
// Função para obter a próxima equipa na fila
async function getNextInQueue(partnerId: string) {
  const { data: nextGroup } = await supabase
    .from('groups')
    .select('*')
    .eq('partner_id', partnerId)
    .eq('status', 'in_queue')
    .order('approved_at', { ascending: true }) // FIFO: Primeiro a ser aprovado, primeiro a correr
    .limit(1);
    
  return nextGroup[0];
}

// Função para iniciar uma corrida
async function startRace(partnerId: string) {
  // 1. Verificar se já há corrida ativa
  const hasActive = await checkActiveRace(partnerId);
  if (hasActive) throw new Error("Pista ocupada");

  // 2. Obter próximo da fila
  const group = await getNextInQueue(partnerId);
  if (!group) throw new Error("Fila vazia");

  // 3. Transação Atómica:
  // - Criar registo na tabela 'races' (status: active)
  // - Atualizar 'groups' (status: racing)
  // - Notificar via SMS o próximo da fila ("Prepara-te, és o próximo!")
  await executeRaceTransaction(group.id, partnerId);
}
```

## 2. Estratégia de Escalabilidade

Para suportar centenas de parceiros e milhares de corridas diárias:

### A. Base de Dados (Supabase/Postgres)
- **Row Level Security (RLS):** Garantir que cada parceiro apenas acede aos seus dados (`partner_id`).
- **Índices:** Criar índices compostos em `(partner_id, status, approved_at)` para garantir que a consulta da fila é instantânea mesmo com milhares de registos.
- **Read Replicas:** Utilizar réplicas de leitura para dashboards de SuperAdmin que agregam dados globais.

### B. Backend (Node.js/Express)
- **Stateless API:** O servidor não guarda estado da fila em memória; tudo é persistido na DB, permitindo escalar horizontalmente (múltiplas instâncias do backend).
- **WebSockets (Real-time):** Utilizar Supabase Realtime para atualizar os ecrãs de Paddock e Admin sem necessidade de refresh (polling).

### C. Notificações
- **Queue de Mensagens:** Utilizar uma fila de tarefas (ex: BullMQ ou Supabase Edge Functions) para processar envios de SMS em background, evitando bloquear a API principal.

### D. Multi-Tenancy
- **Isolamento Lógico:** Todos os dados partilham as mesmas tabelas mas são filtrados por `partner_id`.
- **Configurações Dinâmicas:** Cada parceiro tem o seu próprio JSON de `settings` (preços, horários, capacidade da pista).
