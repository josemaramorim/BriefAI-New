# Plano de Execução: Fluxo do Respondente Completo

Este plano visa resolver as lacunas identificadas na análise de consistência, garantindo que o cliente final visualize corretamente as imagens e que a lógica condicional funcione para todos os novos tipos de dados.

## Mudanças Propostas

### Frontend

#### 1. QuestionRenderer.tsx
- Implementar a função `resolveImageUrl` para prefixar URLs relativas com o endereço do backend (`http://localhost:3001`).
- Aplicar esta função no componente `image_choice`.

#### 2. BriefFiller.tsx
- Refinar a função `evaluateRules` para tratar corretamente arrays de seleção (novos campos de imagem).
- Adicionar logs de depuração para facilitar o rastreio de regras que não estão sendo disparadas.

#### 4. UI Consistency & Theme Toggle (Dark/Light Mode)
- Substituir cores fixas (ex: `bg-slate-50`, `bg-white`, `text-slate-900`) por variáveis do Shadcn/Tailwind (ex: `bg-background`, `bg-card`, `text-foreground`).
- Integrar o componente `ModeToggle` existente no cabeçalho do `BriefFiller.tsx` e `BriefingDetails.tsx`.
- Aplicar essas mudanças no `BriefFiller.tsx` e `QuestionRenderer.tsx` para garantir que o layout responda corretamente ao tema.

### Backend

#### 1. index.ts
- Revisar o salvamento de respostas para garantir que arrays de strings (usados em seleções múltiplas de imagem) sejam persistidos corretamente.

## Plano de Verificação

### Testes Manuais
1. Criar um template com `image_choice`.
2. Abrir o link público de resposta.
3. Verificar se as imagens carregam.
4. Selecionar uma imagem que dispara uma regra e verificar se o bloco alvo aparece.
5. Finalizar o briefing e verificar se a resposta foi salva no banco.
