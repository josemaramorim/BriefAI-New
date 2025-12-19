# Backlog do MVP — BriefAI

Prioridade: Alta — objetivo: entregar o Core Executável do MVP conforme `Core_MVP.md`.

## Visão
Backlog estruturado em épicos e histórias usuários para implementação rápida do Core MVP: builder básico, engine de execução com regras condicionais, persistência multi-tenant e exportação JSON/PDF.

---

## Épico A — Builder Básico (Criar template)
Objetivo: Permitir que um `Editor` crie e publique templates com blocos, perguntas e regras.

Histórias:
A1. Como Editor, quero criar um novo template com nome e descrição, para iniciar modelagem.
- Critérios de aceitação: botão criar template; template salvo com status Rascunho; campo nome obrigatório.

A2. Como Editor, quero adicionar blocos e perguntas dentro do template, para estruturar o briefing.
- Critérios: adicionar/remover blocos; adicionar tipos de pergunta (texto curto, texto longo, múltipla escolha, número); ordem ajustável por drag/drop.

A3. Como Editor, quero definir regras condicionais simples no template (condição -> ação), para controlar fluxo adaptativo.
- Critérios: criar regra com pergunta origem, operador e valor; escolher ação (ativar_bloco, pular_pergunta, encerrar); regra salva e listada.

A4. Como Editor, quero publicar uma versão do template, para disponibilizá-lo a Respondentes.
- Critérios: versão criada; status Publicado; histórico básico de versão.

Est. A: 5–8 dias (backend + UI mínimo)

---

## Épico B — Engine de Execução (Runner)
Objetivo: Executar um briefing passo a passo aplicando regras condicionais em tempo real.

Histórias:
B1. Como Respondente, quero iniciar um briefing a partir de um template publicado.
- Critérios: nova instância criada; metadata (tenant, user) persistida; estado = em_progresso.

B2. Como Respondente, quero ver uma pergunta por vez e avançar, para foco e completude.
- Critérios: UI apresenta apenas pergunta ativa; next/prev funcional; barra de progresso visível.

B3. Como Respondente, quero que o runner aplique regras e exiba/oculte sub-blocos dinamicamente.
- Critérios: pelo menos 3 regras de teste acionadas e validadas; fluxo se adapta sem recarregar página.

B4. Como Respondente, quero autosave das respostas e retomada posterior.
- Critérios: após X segundos/ao mudar pergunta, resposta salva; ao retornar, estado é restaurado.

Est. B: 5–8 dias

---

## Épico C — Modelo de Dados & Persistência
Objetivo: Definir e implementar entidades centrais e armazenamento multi-tenant.

Histórias:
C1. Como Engenheiro, quero o modelo de dados para Template, Bloco, Pergunta, Regra, InstânciaBriefing e Resposta.
- Critérios: tabelas/coleções definidas; migration inicial; documentação do schema (ja no repo).

C2. Como Engenheiro, quero isolamento lógico por tenant para templates e instâncias.
- Critérios: queries filtram por tenant_id; testes manuais com 2 tenants demonstrando isolamento.

C3. Como Engenheiro, quero versionamento de template (versões imutáveis) para regressão segura.
- Critérios: publicar cria versão; instâncias referenciam versão fixada.

Est. C: 3–5 dias

---

## Épico D — Exportação e Integrações Básicas
Objetivo: Exportar briefing final em JSON e gerar PDF resumo; oferecer webhook simples.

Histórias:
D1. Como Respondente/Admin, quero exportar o briefing final em JSON com schema padronizado.
- Critérios: arquivo JSON contém `template`, `responses`, `metadata` e timestamps; schema validado em 3 casos de teste.

D2. Como Respondente/Admin, quero gerar um PDF resumo com título, respostas chave e metadados.
- Critérios: PDF gerado; legível; inclui logo do tenant (opcional).

D3. Como Admin, quero configurar um webhook para notificar outro sistema quando briefing finalizado.
- Critérios: enviar POST com payload JSON de exportação; status/erro logado.

Est. D: 2–4 dias

---

## Épico E — Autenticação, Papéis e Segurança Básica
Objetivo: Implementar autenticação, roles e controles básicos de acesso.

Histórias:
E1. Como Admin, quero criar usuários e atribuir papéis (Admin/Editor/Respondente).
- Critérios: CRUD de usuários; atribuição de papel; UI mínima para gestão.

E2. Como Engenheiro, quero autenticação básica (JWT/session) e verificação por endpoint.
- Critérios: endpoints protegidos; testes manuais de acesso negado/permitido.

E3. Como Engenheiro, quero logs de auditoria para publicações e alterações críticas.
- Critérios: registro de user_id, ação, timestamp para eventos publish/edit.

Est. E: 2–3 dias

---

## Épico F — QA, Documentação e Deploy Local
Objetivo: Garantir testes manuais/automatizados mínimos e documentação de execução local.

Histórias:
F1. Como Equipe, quero checklist de testes de aceitação (conforme `MVP_Scope.md`).
- Critérios: checklist preenchido em pelo menos 3 execuções de teste.

F2. Como Equipe, quero documentação "run locally" com comandos e schema de export.
- Critérios: README com instruções; arquivo `PRD_BriefAI.md` e `MVP_Scope.md` linkados.

Est. F: 1–2 dias

---

## Ordem Prioritária (MVP)
1. Épico C (Modelo de dados) — base para todo o resto
2. Épico A (Builder básico)
3. Épico B (Runner/Engine)
4. Épico E (Auth & roles)
5. Épico D (Exportações e webhooks)
6. Épico F (QA e docs)

## Critérios de Done (Definition of Done)
- Código com testes básicos (unit/integration onde aplicável).
- Documentação mínima atualizada (README, schema export).
- Deploy local/ambiente de teste possível seguindo instruções.
- Aceitação manual dos critérios listados em `Core_MVP.md` e `MVP_Scope.md`.

---

## Próximos passos imediatos
- Revisar backlog e priorizar histórias para as próximas 2 sprints.
- Gerar tasks técnicas por história (endpoints, migrations, componentes UI).
- Atribuir responsáveis e estimativas finais.

Arquivo gerado para guiar implementação e planejamento de sprints do MVP.
