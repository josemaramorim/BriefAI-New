# Análise: Relação entre Template e Workflow

## 1. O que é o Template?
- Define a estrutura do formulário/briefing: blocos, perguntas, tipos de resposta, obrigatoriedade, placeholders, etc.
- Pode conter regras condicionais (ex: mostrar bloco X se resposta Y for Z).
- É a “forma” do briefing, ou seja, o que será apresentado ao usuário final.

## 2. O que é o Workflow?
- Define o fluxo de execução, automações, integrações e etapas do processo.
- Pode incluir: aprovações, notificações, integrações externas, etapas de revisão, deadlines, etc.
- Orquestra como o template será usado, por quem, em que ordem, e o que acontece após cada etapa.

## 3. Como eles se relacionam?
- O Workflow utiliza um ou mais Templates como base para suas etapas.
- O Template é o “conteúdo” e o Workflow é o “roteiro/processo”.
- O Workflow pode:
  - Definir quando e como um template é apresentado/preenchido.
  - Definir regras de transição entre etapas com base em respostas do template (condicionais).
  - Acionar automações (ex: enviar e-mail, criar tarefa) após o preenchimento ou aprovação de um template.

## 4. Posso criar um Template usando o Workflow?
- **Diretamente:** Não é o padrão. O Template geralmente é criado no editor de templates, pois envolve estrutura de dados, campos, tipos, etc.
- **Indiretamente:** O Workflow pode referenciar templates já criados, e pode até sugerir a criação de um novo template durante a configuração de um novo fluxo.
- **Regras Condicionais:** O Workflow pode definir regras de transição entre etapas baseadas em respostas do template, mas a lógica condicional interna do template (ex: mostrar/esconder perguntas) continua sendo definida no editor de templates.

## 5. Cenário ideal de integração
- O usuário cria o Template no editor de templates, incluindo regras condicionais de exibição de campos/blocos.
- No editor de Workflow, o usuário monta o fluxo, selecionando quais templates serão usados em cada etapa, quem preenche, quem aprova, e define automações.
- O Workflow pode adicionar regras de transição entre etapas baseadas em respostas do template, mas não altera a estrutura do template em si.

---

> Esta análise serve como base para discussões de arquitetura e evolução do produto. Caso queira detalhar exemplos práticos, fluxos ou limitações, basta solicitar.
