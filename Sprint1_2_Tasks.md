# Tasks Técnicas — Sprints 1 e 2

Objetivo: transformar as histórias priorizadas em tasks técnicas concretas e atribuíveis para as duas primeiras sprints.

## Sprint 1 (prioridade: Modelo de Dados + Builder Mínimo)
Duração sugerida: 10 dias

1) Infra / Inicialização
- Configurar repositório (monorepo/simples), lint, formatter.
- Configurar acesso ao banco Postgres remoto usando credenciais (URI) fornecidas via `.env` (ex.: `DATABASE_URL`).
- Validar conectividade ao banco remoto e criar script de seed que use a conexão remota para popular 2 tenants de teste.
- Instruções: definir `DATABASE_URL` em `.env` com a URI do Postgres remoto; não commitar credenciais no repositório. Fornecer procedimento de rollback/teste de conexão.

2) Modelo de Dados (migrations)
- Definir migrations para: tenants, users, templates, template_versions, blocks, questions, rules, brief_instances, responses, audit_logs.
- Criar models/ORM (ex: Prisma/TypeORM/Sequelize) com relacionamentos e índices.
- Implementar versionamento: publicar cria registro em template_versions imutável.

3) Autenticação e Roles Específicas
- Implementar endpoints auth básico (register/login) — JWT ou session.
- CRUD de usuários e atribuição de papel (Admin/Editor/Respondente).
- Middleware de autorização por papel e tenant.

4) API Templates CRUD (backend)
- Endpoints: create/update/get/list/publish (template + blocks + questions + rules).
- Validar payload e armazenar versão na publicação.
- Tests unitários básicos para endpoints principais.

5) UI Builder mínimo (frontend)
- Página: criar template (nome, descrição), salvar rascunho.
- Componente: adicionar blocos, adicionar perguntas (tipos: texto curto, texto longo, múltipla escolha, número).
- Lista de regras simples (criar/editar/remover) com UI mínima (select pergunta, operador, valor, ação).
- Botão publicar (chama endpoint publish).

6) Documentação e scripts
- README com instruções run-local (DB, seed, start).
- Swagger/OpenAPI mínimo para endpoints criados.

## Sprint 2 (prioridade: Runner, Regras em tempo real, Exportação)
Duração sugerida: 10 dias

1) Engine de Execução (runner) — backend
- Endpoint para iniciar instância de briefing (cria brief_instance ligado a template_version).
- Endpoint para salvar resposta parcial (autosave) e carregar estado da instância.
- Implementar aplicação de regras (rules engine simples) que avalia condições e retorna ações a aplicar (ativar/desativar bloco, pular pergunta, encerrar).

2) UI Runner (frontend)
- Página de execução: apresentar uma pergunta por vez, next/prev, barra de progresso.
- Consumir endpoint de regras em real-time (ou client-side evaluation dependendo da arquitetura escolhida).
- Implementar autosave (debounce) e restauração ao reabrir instancia.

3) Regras e Sub-blocos
- Garantir que o runner suporte exibir/ocultar sub-blocos conforme regras.
- Validar operadores básicos (`=, !=, contains, >, <, in`) e AND/OR simples.

4) Exportação JSON e PDF
- Implementar endpoint que retorna JSON de exportação (schema: template, metadata, responses).
- Gerar PDF simples no servidor (ex: wkhtmltopdf / Puppeteer) com resumo executivo (título, respostas chave, metadados).

5) Multi-tenant e Segurança
- Revisar queries para garantir tenant_id em todas operações críticas.
- Testes manuais: criar 2 tenants e validar isolamento.

6) Webhook simples e Audit
- Endpoint de configuração de webhook por tenant (salvar URL).
- Ao finalizar briefing, enviar POST ao webhook com payload da exportação e gravar log de entrega.
- Implementar audit logs para publish/edit actions.

7) QA e Testes de Aceitação
- Executar checklist de `MVP_Scope.md` para os casos de teste essenciais.
- Corrigir bugs críticos e levantar issues para Sprint 3.

## Entregáveis por Sprint
Sprint 1:
- Migrations e models implementados.
- Auth + roles básicos prontos.
- Endpoints CRUD para templates e publish.
- UI Builder mínimo funcional (criar template, blocos, perguntas, publicar).
- README + API docs.

Sprint 2:
- Runner funcional com regras ativas e autosave.
- Exportação JSON e PDF.
- Webhook básico e audit logs.
- Testes manuais e checklist preenchido.

## Observações e Decisões Técnicas (recomendadas)
- Banco: Postgres (relacional facilita versionamento e queries complexas).
- Backend: Node.js + Express/Koa ou Python FastAPI (preferência da equipe).
- ORM: Prisma (JS/TS) ou SQLAlchemy (Python) para migrations e models.
- Frontend: React + Vite (fácil de iterar) com componentes simples para drag/drop (ex: react-beautiful-dnd).
- Regras: inicialmente avaliar no backend; para UX mais responsiva, uma representação serializável das regras pode ser enviada ao cliente para avaliação local.

## Próximos passos imediatos
- Aprovar divisão e estimativas.
- Criar tasks técnicas (sub-tasks) em tracker (Jira/GitHub Issues) com responsáveis.
- Iniciar Sprint 1 configurando branch e pipelines CI simples.
