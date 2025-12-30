# Plano de Execução: Estabilização de Referências em Templates

## 1. Geração e uso de key única
- Garantir que blocos e perguntas recebam uma key única já na criação, mesmo antes do salvamento.
- Usar essa key em todas as referências de regras, tanto no frontend quanto no backend.

## 2. Atualização das regras
- Modificar o sistema para que as regras usem a key como referência, nunca o ID.
- No backend, mapear a key para o ID real ao processar as regras.

## 3. Validação antes de salvar
- Implementar uma rotina de validação que percorra todas as regras e verifica se as keys referenciadas existem nos blocos/perguntas do template.
- Se houver inconsistências (referência a key inexistente, duplicidade, etc.), exibir um alerta ao usuário detalhando o problema e impedir o salvamento.
- As mensagens de validação devem ser claras e indicar exatamente onde está o problema (ex: qual regra, bloco ou pergunta), para que o usuário consiga localizar e corrigir rapidamente.

## 4. Feedback ao usuário
- Exibir mensagens de erro claras e específicas, como já feito para imagens, indicando quais regras estão inconsistentes e o motivo.

## 5. Testes e documentação
- Testar todos os fluxos: criação, edição, salvamento, deleção de blocos/perguntas e regras.
- Documentar a nova lógica de referência por key e o fluxo de validação.
