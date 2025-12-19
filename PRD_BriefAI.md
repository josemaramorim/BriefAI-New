# PRD: Plataforma SaaS de Briefing Inteligente

## 1. Visão Geral
Breve descrição: Plataforma SaaS multi-tenant para criação e execução de briefings inteligentes, modular por blocos com regras condicionais, builder no-code e runner guiado (uma pergunta por vez). Foco em MVP executável, escalabilidade e evolução com IA.

## 2. Proposta de Valor
- Público: Empresas B2B/B2C/B2B2C, agências, consultorias, times internos.
- Problemas: briefings incompletos, retrabalho, falta de padronização.
- Benefício: coleta estruturada, fluxo adaptativo, resumo executivo exportável.

## 3. Conceito Central
- Briefing = árvore de decisão composta por blocos (modulares, ativáveis/desativáveis).
- Blocos podem ter sub-blocos e regras condicionais que alteram o fluxo.
- Execução: apresentação de uma pergunta por vez; salvamento automático; retomada.

## 4. Entidades Principais (ERD - Resumo em texto)
- Tenant: id, nome, plano, configurações.
- Time: id, tenant_id, nome.
- Usuário: id, email, papel (Admin/Editor/Respondente), time_id.
- Template: id, tenant_id, nome, descrição, tipo, versão, status.
- Bloco: id, template_id, nome, tipo, ordem, ativo.
- Pergunta: id, bloco_id, texto, tipo_resposta, propriedades (obrigatória, validação, ajuda, exemplos).
- Regra: id, template_id, condição (expressão), ação (ativar/desativar/exibir/encerrar).
- InstânciaBriefing: id, template_id, tenant_id, estado (rascunho, em_progresso, finalizado), metadados.
- Resposta: id, instancia_id, pergunta_id, valor, timestamp.
- VersãoTemplate: histórico de alterações.

## 5. Templates e Blocos
- Templates: nome, descrição, tipo de negócio, objetivo, blocos iniciais, versão.
- Blocos padrão sugeridos: Contexto, Objetivos, Público-alvo, Solução, Escopo, KPIs, Stakeholders, Integrações, Compliance.

## 6. Tipos de Pergunta e Propriedades
- Tipos: texto curto, texto longo, número, múltipla escolha, checkbox, escala, upload, seleção visual.
- Propriedades: obrigatória, ajuda contextual, exemplos, validação (min/max/regex), dependências.

## 7. Regras Condicionais (DSL sugerido)
- Condição: `pergunta_id | operador | valor` (ex.: `tipo_produto = SaaS B2B`).
- Ações suportadas: ativar_bloco(bloco_id), desativar_bloco(bloco_id), exibir_subbloco(id), alterar_proxima_pergunta(id), encerrar_briefing(), marcar_incompleto().
- Notas: suportar operadores `=, !=, contains, >, <, in` e grouping lógico (AND/OR).

## 8. UX / Execução
- Runner: uma pergunta por vez, barra de progresso, autosave, retomada de sessão.
- Visual por bloco: cards com título, descrição e número de perguntas.
- Preview em tempo real e resumo executivo ao final.

## 9. Builder Visual (No-code) - Funcionalidades mínimas
- Criar/editar templates, adicionar blocos e perguntas, definir regras condicionais, arrastar e soltar blocos, simular fluxo, versionamento, publicar.

## 10. MVP — Escopo e Critérios de Aceitação
Escopo mínimo (entregáveis):
- Multi-tenant com isolamento lógico.
- Builder básico (criar template, adicionar blocos e perguntas, salvar versão).
- Engine de execução que aplica regras condicionais e apresenta perguntas uma a uma.
- Persistência de instâncias de briefing e respostas.
- Exportação: JSON e PDF básico.
- Permissões: Admin/Editor/Respondente.

Critérios de aceitação (mensuráveis):
- Criar e publicar 3 templates de exemplo.
- Criar e completar 1 briefing por template e exportar JSON/PDF com dados corretos.
- Fluxo adaptativo teste coberto: pelo menos 3 regras condicionais distintas sendo acionadas.
- Autenticação e separação por tenant verificada em cenários simples.

## 11. Roadmap Pós-MVP
- IA: sugestão automática de perguntas, análise de completude, score de qualidade.
- Templates inteligentes por segmento, integração com CRMs, webhooks e analytics.

## 12. Segurança e Operação (linha de base)
- Isolamento lógico por tenant; criptografia em trânsito; backups regulares.
- Logs de auditoria para mudanças de templates e publicações.
- Controle de acesso por papel e permissões granulares.

## 13. Métricas e KPIs iniciais
- Taxa de completude de briefings (% finalizados).
- Tempo médio para completar um briefing.
- Nível de reutilização de templates (quantas instâncias por template).
- Erros nas regras (logs/traces para debugging).

## 14. Exemplo — Template preenchido (demonstração)
Template: "Lançamento Produto SaaS"
- Bloco: Contexto do Negócio
  - Pergunta: "Qual é o principal objetivo do projeto?" (múltipla escolha)
    - Resposta: "Crescimento"
- Bloco: Modelo de Negócio
  - Pergunta: "Modelo?" (múltipla escolha)
    - Resposta: "Assinatura"
  - Sub-bloco: Planos (exibido por regra quando Modelo = Assinatura)
    - Pergunta: "Número de planos esperados" (número)
      - Resposta: 3
Export JSON (resumo):
{
  "template":"Lançamento Produto SaaS",
  "responses":{
    "objetivo":"Crescimento",
    "modelo":"Assinatura",
    "num_planos":3
  }
}

## 15. Próximos Passos Imediatos (recomendado)
1. Validar e aprovar os critérios de aceitação do MVP.
2. Gerar ERD detalhado (diag. lógico) e lista de APIs CRUD para entidade principal.
3. Criar backlog inicial (épicos + histórias prioritárias) seguindo o Escopo do MVP.

---
Documento gerado a partir do `prompt-inicial.txt` para guiar desenvolvimento e validação do produto.
