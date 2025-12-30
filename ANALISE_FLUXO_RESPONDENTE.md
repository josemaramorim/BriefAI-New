# Análise de Consistência: Fluxo do Respondente

Esta análise verifica se o processo de resposta do cliente (respondente) reflete corretamente todas as funcionalidades e mudanças recentes implementadas no sistema de templates.

## 1. Suporte a `image_choice` (Escolha por Imagem)
- **Status**: ✅ Parcialmente Implementado
- **Observação**: O `QuestionRenderer.tsx` já possui lógica para renderizar o tipo `image_choice`. Ele suporta seleção única e múltipla baseada na configuração do template.
- **Ponto de Atenção (CRÍTICO)**: As URLs das imagens salvas no template são relativas (ex: `/briefs/id/images/img.jpg`). O componente `img` tenta carregar do mesmo host do frontend (geralmente porta 5173). Como as imagens são servidas pelo backend (porta 3001), elas **não carregarão para o cliente ou para o administrador** a menos que a URL seja resolvida corretamente.

## 2. Visualização de Resultados (Sidebar "BRIEFING")
- **Status**: ⚠️ Inconsistente
- **Observação**: O `BriefingDetails.tsx` tenta renderizar escolhas de imagem, mas espera um objeto `{url, label}`, enquanto o sistema atual salva apenas a `string` da URL no banco de dados.
- **Ponto de Melhoria**: Ajustar o `renderValue` para suportar tanto strings quanto prefixar as URLs corretamente para exibição no painel administrativo.

## 3. Motor de Regras Condicionais
- **Status**: ✅ Funcional, mas básico
- **Observação**: O `BriefFiller.tsx` avalia regras de `activate_block`.
- **Compatibilidade**: O operador `contains` usado no avaliador é compatível com o tipo `image_choice`, pois este retorna um array de strings.
- **Limitação**: O motor atual só suporta ativação de blocos. Regras mais complexas (esconder campos individuais, validações cruzadas) ainda não estão integradas no fluxo do respondente.

## 3. Versionamento e Snapshots
- **Status**: ✅ Excelente
- **Observação**: O backend (`/brief-instances/start`) cria um snapshot (`TemplateVersion`) no momento em que o cliente inicia o briefing. Isso garante que, mesmo que o template seja alterado depois, o cliente responda à versão exata que foi enviada a ele.

## 4. Caminho Configurável (`LOCAL_IMAGES_PATH`)
- **Status**: ✅ Consistente
- **Observação**: A implementação recente do `express.static` no backend garante que, independentemente de onde as imagens sejam salvas fisicamente, elas estarão acessíveis via `/briefs/...`. O fluxo do respondente está alinhado com essa estrutura de URL.

## 5. Experiência de Identificação (LGPD/Auth)
- **Status**: ✅ Funcional
- **Observação**: O fluxo de "Boas-vindas" solicita Nome e Email, criando um usuário com role `Respondente`. Isso garante que as respostas fiquem vinculadas a uma pessoa real, facilitando a auditoria.

## Recomendações de Ajuste
1.  **Prefixar URLs de Imagem**: Ajustar o `QuestionRenderer.tsx` ou adicionar um helper para garantir que URLs relativas recebam o `baseURL` da API.
2.  **Refinar Avaliação de Regras**: Expandir o `evaluateRules` para suportar expressões mais complexas, especialmente para lidar com as novas opções de configuração de perguntas.
