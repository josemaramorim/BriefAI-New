# Análise e Plano: Perguntas com Seleção de Imagens (Single/Multiple Choice)

## Cenário do Cliente
- O cliente de arquitetura deseja criar perguntas em seus briefings onde o usuário final pode escolher entre imagens.
- Existem dois comportamentos desejados:
  1. O usuário pode escolher **apenas uma** imagem (single choice).
  2. O usuário pode escolher **uma ou mais** imagens (multiple choice).

## Situação Atual da Aplicação
- O editor de templates atual permite perguntas de múltipla escolha (texto), mas **não** há suporte nativo para seleção de imagens como opções.
- Não há componente visual pronto para exibir imagens como opções clicáveis (tipo "gallery picker").
- Não há configuração para limitar a seleção a uma ou múltiplas imagens em perguntas desse tipo.

## Limitações Atuais
- Não é possível criar perguntas do tipo "Escolha de Imagem" diretamente pelo editor.
- Não há upload/gestão de imagens como opções de resposta.
- Não há validação para limitar a seleção a uma ou múltiplas imagens.

## Plano para Atender o Requisito

### 1. Novo Tipo de Pergunta: Escolha de Imagem
- Adicionar ao editor de templates o tipo "Escolha de Imagem" (Image Choice).
- Permitir ao criador da pergunta:
  - Fazer upload ou selecionar imagens para cada opção.
  - Definir se a seleção é única (radio) ou múltipla (checkbox).
  - Adicionar legenda/texto opcional para cada imagem.

### 2. Componente Visual para Seleção de Imagens
- Criar um componente de UI que exiba as imagens como opções clicáveis.
- Comportamento:
  - Se single choice: apenas uma imagem pode ser selecionada (estilo radio button visual).
  - Se multiple choice: múltiplas imagens podem ser selecionadas (estilo checkbox visual).
- Destacar visualmente as imagens selecionadas.

### 3. Validação e Integração
- Garantir que a resposta respeite a configuração (apenas uma ou múltiplas imagens).
- Salvar a(s) imagem(ns) selecionada(s) como resposta no backend.
- Permitir visualização da escolha na revisão do briefing.

### 4. UX e Acessibilidade
- Permitir navegação por teclado e descrição alternativa das imagens.
- Garantir responsividade para dispositivos móveis.

### 5. Roadmap de Implementação
1. Modelar o novo tipo de pergunta no backend e frontend.
2. Implementar upload/seleção de imagens no editor de perguntas.
3. Criar o componente visual de seleção de imagens.
4. Integrar validação e salvamento das respostas.
5. Testar e validar com casos reais do cliente de arquitetura.

### Alternativa para desenvolvimento: armazenamento local

Durante o desenvolvimento ou em ambientes de homologação, é possível gravar as imagens localmente no servidor, organizando cada template ou briefing em sua própria pasta de imagens.

**Vantagens:**
- Não exige conta ou custos com serviços de nuvem durante o desenvolvimento.
- Facilita testes e validação do fluxo de upload e seleção de imagens.
- Permite migração futura para nuvem sem grandes mudanças na lógica de negócio (basta trocar o provider de armazenamento).

**Sugestão de estrutura local:**
- Pasta raiz de imagens: `/uploads/templates/{templateId}/` ou `/uploads/briefings/{briefingId}/`
- Cada imagem salva com nome único e referência no banco de dados.
- Permitir configuração do caminho base para facilitar migração.

**Roadmap ajustado:**
- Implementar upload local durante desenvolvimento.
- Permitir configuração do provider de armazenamento (local ou nuvem) via variável de ambiente.
- Documentar o processo de migração para nuvem para produção.

### Observação sobre armazenamento de imagens

Salvar imagens diretamente no banco de dados pode aumentar drasticamente o tamanho e dificultar a escalabilidade e performance.

**Alternativa recomendada:**
- Utilizar armazenamento em nuvem (ex: Amazon S3, Google Cloud Storage, Azure Blob Storage, Google Drive, etc).
- Salvar apenas o link/URL da imagem no banco de dados.
- Permitir upload direto do editor para o serviço de nuvem, retornando o link para uso nas opções de resposta.

**Vantagens:**
- Reduz o tamanho do banco de dados.
- Facilita o gerenciamento, backup e distribuição das imagens.
- Permite servir imagens de forma otimizada (CDN, cache, etc).

**Roadmap ajustado:**
- Integrar o editor de perguntas com serviço de armazenamento em nuvem.
- Implementar upload seguro e obtenção do link da imagem.
- Salvar apenas o link/URL no banco, nunca o arquivo binário.
- Garantir que as imagens estejam disponíveis e protegidas conforme regras de acesso do briefing.

---

> Com essa evolução, a aplicação atenderá tanto perguntas de escolha única quanto múltipla de imagens, ampliando o leque de casos de uso para clientes de arquitetura, design, moda, etc. Além disso, com a adoção de armazenamento em nuvem, o sistema se tornará mais escalável, seguro e preparado para grandes volumes de imagens, sem sobrecarregar o banco de dados principal.
