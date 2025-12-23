# Premissas Fundamentais do BriefAI

Este documento contém as regras e princípios inegociáveis do sistema, que devem ser seguidos em todas as implementações e propostas.

## 1. Auditoria Total (Premissa Principal)
- **Tudo deve ser auditável**: Nenhuma ação significativa (criação, edição, exclusão, publicação, alteração de status) pode ocorrer sem um registro na tabela `AuditLog`.
- **Identificação**: Todo log de auditoria deve conter obrigatoriamente:
    - **Quem**: User ID e **Nome do Usuário**.
    - **Quando**: **Data e Hora exata** (Timestamp).
    - **Onde**: Qual Tenant (Tenant ID).
    - **O que**: Qual ação realizada e Entidade afetada (com ID).
    - **Detalhes**: Metadata com snapshot dos dados se necessário.

## 2. Fluxo de Edição Controlada
- **Integridade de Templates**: Templates publicados não podem ser editados "silenciosamente".
- **Ação Explícita**: Para alterar um template publicado, o usuário deve clicar em um botão específico (ex: "Abrir para Edição") e confirmar a ação.
- **Registro de Intenção**: O ato de reverter um template para rascunho para fins de edição deve ser registrado na auditoria com o autor da ação.
