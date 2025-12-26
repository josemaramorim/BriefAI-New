# Plano de Execução: Perguntas com Seleção de Imagens (Single/Multiple Choice)

## Objetivo
Implementar perguntas do tipo "Escolha de Imagem" no editor de templates, permitindo seleção única ou múltipla, com suporte a armazenamento local e em nuvem.

## Etapas do Plano

### 1. Modelagem e Backend
- Definir novo tipo de pergunta no modelo (Image Choice).
- Permitir configuração de seleção única ou múltipla.
- Modelar estrutura para armazenar links de imagens (não arquivos binários).
- Implementar endpoints para upload local e integração futura com nuvem.

### 2. Upload e Gestão de Imagens
- Implementar upload local: cada template/briefing terá sua própria pasta de imagens.
- Salvar imagens com nomes únicos e registrar o link no banco.
- Permitir configuração do provider de armazenamento (local/nuvem) via variável de ambiente.
- Documentar processo de migração para nuvem.

### 3. Editor de Templates
- Adicionar opção "Escolha de Imagem" no editor de perguntas.
- Permitir upload/seleção de imagens para cada opção.
- Configurar se a pergunta aceita uma ou múltiplas imagens.
- Adicionar campo de legenda/texto opcional para cada imagem.

### 4. Componente Visual de Seleção
- Criar componente de UI para exibir imagens como opções clicáveis.
- Implementar comportamento de seleção única (radio) e múltipla (checkbox).
- Destacar visualmente as imagens selecionadas.
- Garantir responsividade e acessibilidade (teclado, descrição alternativa).

### 5. Validação e Salvamento de Respostas
- Validar seleção conforme configuração (única/múltipla).
- Salvar apenas os links das imagens selecionadas como resposta.
- Permitir visualização da escolha na revisão do briefing.

### 6. Integração com Nuvem (Produção)
- Integrar upload com serviço de nuvem (S3, Google Cloud Storage, etc).
- Salvar apenas o link/URL da imagem no banco.
- Garantir segurança e disponibilidade das imagens conforme regras de acesso.

### 7. Testes e Homologação
- Testar upload local e seleção de imagens em ambiente de desenvolvimento.
- Validar migração para nuvem em ambiente de produção.
- Testar casos reais do cliente de arquitetura.

## Benefícios
- Flexibilidade para desenvolvimento e produção.
- Redução de custos iniciais e escalabilidade futura.
- Atende casos de uso de arquitetura, design, moda, etc.

---

> Este plano pode ser detalhado em tarefas menores para execução em sprints, conforme prioridades do time e demandas dos clientes.
