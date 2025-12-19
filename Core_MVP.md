# Core Executável do MVP — BriefAI

## Objetivo
Definir o menor fluxo que entrega valor vendável: um template funcional criado via builder, com blocos e perguntas, regras condicionais ativas durante a execução, e exportação final (JSON + PDF).

## Escopo Fechado (mínimo obrigatório)
- Criar 1 template funcional via Builder.
- Template contém: ≥2 blocos, ≥5 perguntas totais, ≥1 sub-bloco exibido por regra.
- Definir ≥3 regras condicionais (por exemplo: ativar sub-bloco, pular pergunta, encerrar briefing).
- Runner apresenta perguntas uma a uma, com autosave e retomada.
- Persistir instância de briefing e respostas.
- Exportar briefing final em JSON (schema) e gerar PDF resumo.
- Autenticação básica e papéis mínimos: Admin, Editor, Respondente.

## O que entra (MVP Core)
- Builder básico: criar template, adicionar blocos/perguntas, regras simples, salvar e publicar.
- Engine de execução: aplicar regras em tempo real, navegar perguntas, autosave, retomada.
- Persistência multi-tenant básica (isolamento lógico).
- Exportador JSON + PDF simples.
- Testes manuais cobrindo fluxo adaptativo.

## O que fica fora (não-MVP)
- Sugestão automática de perguntas por IA.
- Integrações profundas com CRMs (apenas webhooks/exports básicos se necessário).
- Permissões muito granulares ou workflows complexos.
- Dashboards analíticos avançados.

## Critérios Claros de Sucesso (Aceitação)
1. Template funcional: é possível criar e publicar um template que contém blocos, perguntas e regras.
2. Execução adaptativa: ao menos 3 regras condicionais são acionadas corretamente em execuções de teste.
3. Exportação: para o briefing final, o JSON segue o schema esperado e o PDF contém título, respostas chave e metadados (tenant, usuário, data).
4. Retomada: iniciar um briefing, preencher parcialmente, recarregar a sessão e retomar com respostas preservadas.
5. Isolamento: dados de um tenant não ficam visíveis para outro (teste com 2 tenants).
6. Permissões básicas: `Respondente` só responde; `Editor` cria/edita templates; `Admin` gerencia tenant e publica.

## Exemplo Prático (passo a passo)
1. Admin cria template "Lançamento Produto SaaS".
   - Bloco A — Contexto (Perguntas: objetivo [mult. escolha], descrição [texto longo]).
   - Bloco B — Modelo de Negócio (Pergunta: modelo [mult. escolha]).
   - Sub-bloco B1 — Planos (Pergunta: número de planos [número]).
2. Regra 1: se `Modelo = Assinatura` então `ativar sub-bloco B1`.
3. Regra 2: se `Objetivo = Redução de custos` então `pular pergunta X`.
4. Regra 3: se `Orçamento < 1000` então `marcar briefing como risco_baixo` (metadado).
5. Usuário inicia o briefing; quando responde `Modelo = Assinatura`, aparece `Planos`.
6. Usuário finaliza; sistema gera `export.json` e `resumo.pdf`.

## JSON Schema de Exportação (exemplo mínimo)
{
  "template": "Lançamento Produto SaaS",
  "metadata": {"tenant_id": "...,", "user_id": "...", "completed_at": "..."},
  "responses": {
    "objetivo": "Crescimento",
    "modelo": "Assinatura",
    "num_planos": 3
  }
}

## Testes de Aceitação (manual) — checklist
- [ ] Criar e publicar template de exemplo.
- [ ] Iniciar briefing e acionar todas as regras configuradas.
- [ ] Confirmar autosave e retomada.
- [ ] Exportar JSON e validar campos.
- [ ] Gerar PDF e revisar layout/resumo.
- [ ] Testar isolamento entre 2 tenants.
- [ ] Verificar permissões de 3 papéis.

## Entregáveis desse Passo
- Arquivo de escopo do Core MVP (`Core_MVP.md`).
- 1 template de exemplo publicado no sistema (ou conjunto de dados de demonstração).
- 3 briefings de teste preenchidos e exportados.
- Checklist de aceitação completo.

## Tempo estimado
1–2 dias úteis (implementação mínima + testes manuais básicos).

---
Documento criado para ser referência imediata e contrato mínimo entre PM, engenharia e UX antes de iniciar desenvolvimento do MVP.