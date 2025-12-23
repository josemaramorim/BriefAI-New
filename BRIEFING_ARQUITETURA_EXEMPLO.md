# Exemplo de Guia: Briefing para Projeto Arquitetônico Residencial

Este documento serve como referência para o **Arquiteto** cadastrar seu primeiro template no sistema **BriefAI**, utilizando as novas funcionalidades de Objetivos de Bloco, Placeholders e Seleção Múltipla.

---

## 🏗️ Informações Gerais do Template
*   **Nome:** Briefing Residencial Premium
*   **Descrição:** Coleta detalhada de dados técnicos, necessidades funcionais e desejos estéticos para projetos de casas de alto padrão.

---

## 📂 Bloco 1: Terreno e Premissas Técnicas
*   **Objetivo do Bloco:** Entender as características físicas e legais do lote para garantir a viabilidade técnica e evitar retrabalhos.

### Perguntas:
1.  **Localização Exata do Lote**
    *   **Tipo:** Texto Curto
    *   **Placeholder:** "Endereço completo ou link do Google Maps"
    *   **Obrigatória:** Sim
2.  **Área Total do Terreno (m²)**
    *   **Tipo:** Número
    *   **Placeholder:** "Ex: 450"
3.  **Situação do Levantamento Topográfico**
    *   **Tipo:** Seleção Única
    *   **Opções:** "Já possuo", "Desejo contratar através do escritório", "Não possuo"
    *   **Placeholder:** "Selecione o estado atual do levantamento"

---

## 👨‍👩‍👧‍👦 Bloco 2: Perfil da Família e Rotina
*   **Objetivo do Bloco:** Conhecer a dinâmica dos moradores para dimensionar os espaços de forma ergonômica e personalizada.

### Perguntas:
1.  **Possui animais de estimação?**
    *   **Tipo:** Seleção Única
    *   **Opções:** "Sim", "Não"
    *   **Dica:** *Você pode configurar uma Regra Condicional para mostrar um bloco extra de "Área Pet" se a resposta for Sim.*
2.  **Qual o regime de trabalho dos moradores?**
    *   **Tipo:** Seleção Múltipla
    *   **Opções:** "Presencial total", "Home Office (Precisa escritório)", "Híbrido", "Viagens frequentes"
    *   **Placeholder:** "Selecione todas as opções que se aplicam aos moradores."

---

## 🎨 Bloco 3: Identidade Estética e Materiais
*   **Objetivo do Bloco:** Definir o "clima" da casa e a paleta de acabamentos que mais agrada o cliente.

### Perguntas:
1.  **Quais destes materiais mais lhe agradam visualmente?**
    *   **Tipo:** Seleção Múltipla
    *   **Opções:** "Madeira Natural", "Pedra Bruta", "Vidro e Transparência", "Concreto Aparente", "Metais (Preto/Bronze)", "Tijolinho"
    *   **Placeholder:** "Selecione os materiais que você gostaria de ver na sua fachada."
2.  **Estilo Arquitetônico Predileto**
    *   **Tipo:** Seleção Única
    *   **Opções:** "Moderno/Minimalista", "Clássico/Contemporâneo", "Industrial", "Rústico Moderno", "Biofílico (Muitas plantas)"
3.  **Descrição de Desejos Extras**
    *   **Tipo:** Texto Longo (Textarea)
    *   **Placeholder:** "Descreva aqui aquele item que não pode faltar na sua casa dos sonhos (ex: adega escondida, vista para o pôr do sol da cama...)"

---

## 🐾 Bloco 4: Área Pet (Condicional)
*   **Objetivo do Bloco:** Projetar espaços específicos para o bem-estar e higiene dos animais, integrando-os à funcionalidade da casa (lavanderia, canil ou área gourmet).

### Perguntas Sugeridas:
1.  **Espécie e Porte dos Animais**
    *   **Tipo:** Texto Curto
    *   **Placeholder:** "Ex: 2 Labradores grandes, 1 Gato persa..."
2.  **Necessidades de Higiene (Pet Bath)**
    *   **Tipo:** Seleção Única
    *   **Opções:** "Desejo área de banho na lavanderia", "Ponto de ducha externo", "Apenas local para secagem", "Não necessita"
    *   **Placeholder:** "Como será feita a higiene do pet em casa?"
3.  **Local de Dormir**
    *   **Tipo:** Seleção Única
    *   **Opções:** "Dentro de casa (quarto/sala)", "Espaço exclusivo (Copa Pet)", "Canil externo planejado"
4.  **Armazenamento e Alimentação**
    *   **Tipo:** Seleção Múltipla
    *   **Opções:** "Gavetão para ração (20kg+)", "Bebedouro automático com ponto de água", "Local para farmácia/acessórios"
    *   **Placeholder:** "Selecione o que gostaria de ter planejado para o dia a dia do pet."
5.  **Observações sobre Comportamento**
    *   **Tipo:** Texto Longo (Textarea)
    *   **Placeholder:** "Ex: O cachorro tem medo de trovão (precisa isolamento acústico), o gato precisa de prateleiras altas (catificação)..."

---

### 💡 Como Configurar Regras Condicionais (Passo a Passo)

Para fazer a pergunta de animais ativar um bloco extra, siga este exemplo técnico:

1.  Crie um novo **Bloco** chamado "Área Pet" (pode ser o Bloco 4).
2.  Vá na seção **Regras Condicionais** e clique em **Adicionar Regra**.
3.  Preencha os campos exatamente assim:

| Campo no Sistema | Valor para digitar (Exemplo) | O que significa? |
| :--- | :--- | :--- |
| **Condição (JSON)** | `{"questionId": "pergunta_pet", "operator": "=", "value": "Sim"}` | Se a pergunta de pets for igual a Sim |
| **Ação (JSON)** | `{"type": "activate_block", "targetId": "bloco_area_pet"}` | Então mostre o bloco da área pet |

> [!TIP]
> No futuro, o sistema terá seletores visuais (clicáveis) para facilitar, mas no momento você usa esse formato JSON para ter controle total sobre a lógica!

---
*Este guia foi gerado para maximizar o uso das ferramentas de auditoria e edição controlada do BriefAI.*
