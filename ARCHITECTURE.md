# KwikRace: Documentação de Arquitetura & Entregáveis (SaaS Platform)

Este guia descreve a especificação técnica dos 12 serviços, APIs e eventos da plataforma **KwikRace**.

---

## 1. Definição dos 12 Serviços (Técnico)

1. **Auth Service**: Gere identidades, permissões (SuperAdmin, PartnerAdmin) e sessões JWT. Isolamento via UUID e Roles.
2. **Partner Service**: Gere o catálogo de parceiros (kartódromos). Configurações de branding, horários de pista e slugs únicos.
3. **User Service**: Gestão de perfis e autenticação de clientes finais para o registo em quiosques.
4. **Group Service**: Motor de registo de grupos de corrida. Valida membros, gera bilhetes e faz o check-in inicial.
5. **Queue Service**: Controlador FIFO por `partner_id`. Garante que cada parceiro tem a sua própria fila isolada em memória/DB.
6. **Racing Engine**: O core do sistema. Garante atomicidade: apenas 1 corrida por parceiro pode estar no estado 'active'.
7. **Notification Service**: Orquestrador de SMS (via SMSHub). Dispara mensagens automáticas baseadas em eventos da fila.
8. **Price Service**: Cálculo dinâmico de taxas de pista e subscrições mensais dos parceiros SaaS.
9. **Logs/Audit**: Auditoria imutável. Regista alterações de status para compliance e prevenção de erros operacionais.
10. **CRM/Contacts Service**: Base de dados de leads e fidelização capturados no momento do registo do grupo.
11. **Global Analytics**: Dashboard de BI (Business Intelligence) agregado para o SuperAdmin e individual para parceiros.
12. **API Gateway**: Porta de entrada única (Proxy). Orquestra requests, trata rate limits e expõe WebSockets.

---

## 2. Especificação de APIs (Principais)

| Endpoint | Método | Serviço | Descrição |
|----------|--------|---------|-----------|
| `/api/public/register` | POST | Group | Registo público de novos grupos (URL por Partner Slug). |
| `/api/queue/approve/:id` | POST | Queue | Admin aprova grupo e coloca-o formalmente na fila FIFO. |
| `/api/racing/start` | POST | Racing | Inicia cronómetro e sessão de corrida (Atomic Check). |
| `/api/analytics/global` | GET | Analytics | Visão agregada de ROI e volume de corridas global. |
| `/api/partner/config` | PATCH | Partner | Atualização de definições (Branding, Preços). |

---

## 3. Catálogo de Eventos (Event-Driven)

A plataforma utiliza um barramento de eventos interno (expansível para Kafka/RabbitMQ):

- `group_registered`: Disparado quando um grupo é criado via quiosque.
- `group_queued`: Quando o admin aprova o grupo. Gatilho para **SMS de Boas-vindas**.
- `race_started`: Notifica o **WebSocket** do cliente para as tabelas de tempos (Leaderboard).
- `race_finished`: Disparado quando os karts saem da pista. Gatilho para **SMS de Resultados**.
- `next_group_alert`: Evento crítico disparado para o grupo sequencial (FIFO+1) para se preparar para entrar em pista.

---

## 4. Estratégia de Deployment

- **Infrastructure**: Dockerized Microservices (separação por diretório /src/services).
- **Orquestração**: Kubernetes (K8s) para auto-scaling de réplicas do Gateway e Racing Engine.
- **Data Isolation**: PostgreSQL Row Level Security (RLS) garantindo que `partner_A` nunca veja dados de `partner_B`.
- **CI/CD**: GitHub Actions com Terraform para provisionamento de infraestrutura em nuvem (AWS/DigitalOcean).
