# MVP — Escopo e Critérios de Aceitação

## Visão Rápida
Entregar um MVP executável da Plataforma SaaS de Briefing Inteligente que permita criar, executar e exportar briefings com fluxo adaptativo por regras condicionais, em ambiente multi-tenant, suficiente para validação com clientes iniciais.

## Escopo Funcional Mínimo (Entregáveis)
- Multi-tenant (isolamento lógico de dados por tenant).
- Autenticação básica (cadastro/login) e papéis: Admin, Editor, Respondente.
- Builder básico (no-code): criar template, adicionar blocos e perguntas, definir regras condicionais simples, salvar e publicar versões.
- Engine de execução (runner): apresentar perguntas uma a uma, aplicar regras condicionais, salvar respostas (autosave) e permitir retomada.
- Persistência: salvar templates, versões, instâncias de briefing e respostas.
- Exportação: exportar briefing final em JSON padrão e geração de PDF simples (resumo executivo).
- Logging básico de auditoria para publicação de templates e alterações críticas.

## Fora do Escopo (MVP)
- Sugestão automática de perguntas por IA.
- Integrações complexas (CRM, pipelines bidirecionais) — apenas webhooks simples se necessário.
- Workflows avançados de permissão além dos papéis básicos.
- Relatórios analíticos detalhados e dashboards.

## Critérios de Aceitação (mensuráveis)
- Templates: é possível criar, publicar e versionar templates (mínimo 3 templates de exemplo criados).
- Execução: para cada template de exemplo, é possível iniciar uma instância de briefing, responder, retomar e finalizar com sucesso.
- Regras: o runner aplica pelo menos 3 regras condicionais distintas em execução (ex.: ativar sub-bloco, pular pergunta, encerrar briefing).
- Exportação: é possível exportar o briefing final em JSON e gerar um PDF com o resumo executivo contendo título do briefing, respostas chave e metadados (data, usuário, tenant).
- Multi-tenant: dados de um tenant não são visíveis para outro (testado com dois tenants de exemplo).
- Permissões: usuários com papel `Respondente` não conseguem editar templates; `Editor` pode editar mas não alterar configurações de tenant; `Admin` tem acesso completo (testes manuais passados).
- Estabilidade: logs de erros básicos em execução e persistência; fluxo de recuperação do runner após falha de rede (autosave + retomada) validado em testes manuais.

## Critérios de Qualidade
- Latência do runner aceitável (tempo < 500ms para carregar próxima pergunta em ambiente de teste local).
- JSON de exportação segue schema definido (campo `template`, `responses`, `metadata`).
- PDF legível com informações chave e sem quebras de layout críticas.

## Casos de Teste Essenciais (manual)
1. Criar template "A", adicionar 3 blocos, publicar; iniciar briefing e completar — exportar JSON/PDF.
2. Criar regra: se pergunta X = Y então exibir sub-bloco Z; validar que sub-bloco aparece apenas quando condição satisfeita.
3. Testar autosave: preencher metade do briefing, forçar reload, retomar e confirmar respostas preservadas.
4. Testar permissões: user Respondente não vê botão de publicar; Editor vê, mas não vê configurações de tenant.
5. Multi-tenant: criar tenant T1 e T2, verificar isolamento de templates e instâncias.

## Entregáveis ao Final do MVP
- Código base com endpoints CRUD para entidades principais.
- UI básica do Builder e Runner funcional.
- Documentação mínima: PRD condensado (link para `PRD_BriefAI.md`), instruções de execução local e schema de exportação JSON.
- Pacote de 3 templates de exemplo e 3 casos de briefing preenchidos (exportados).

## Estimativa Rápida (orientativa)
- Implementação backend + modelagem: 5–8 dias.
- UI (Builder + Runner) básico: 5–8 dias.
- QA + documentação + ajustes: 2–3 dias.

## Próximos Passos Recomendados
- Aprovar critérios de aceitação ou ajustar valores mensuráveis.
- Gerar ERD detalhado e lista de APIs públicas/privadas.
- Criar backlog de épicos e histórias a partir dos entregáveis acima.

---
Arquivo criado para guiar desenvolvimento do MVP e servir como contrato mínimo entre PM, engenharia e UX.