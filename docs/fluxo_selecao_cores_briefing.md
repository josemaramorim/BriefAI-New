# Proposta de Implementação: Seleção de Cores em Briefing Centrada no Cliente

## 1. Princípios
- O cliente é o decisor final das cores.
- O arquiteto pode sugerir cores, mas não limitar (exceto por motivos técnicos/contratuais).
- O sistema deve permitir escolha entre sugestões, paletas reais (marcas) e cor personalizada.

## 2. Fluxo de Configuração (Arquiteto)
- Define pergunta do tipo "cor" (única ou múltipla escolha).
- Pode sugerir cores (básica, personalizada, marcas reais), mas o cliente pode escolher qualquer cor.
- Pode restringir a marca (opcional).

## 3. Fluxo de Resposta (Cliente)
- Visualiza sugestões do arquiteto (se houver).
- Pode buscar e escolher qualquer cor de paletas reais (Suvinil, Coral, Sherwin-Williams, etc).
- Pode escolher cor personalizada via color picker/código HEX.
- Busca por nome/código/marca.
- Visualização clara da(s) cor(es) escolhida(s) com nome, código e amostra.

## 4. Estrutura de Dados (Exemplo)
```json
{
  "type": "color",
  "multiple": true,
  "suggestions": [
    { "hex": "#F44336", "name": "Vermelho Vivo", "brand": "Suvinil", "code": "1234" },
    { "hex": "#2196F3", "name": "Azul Colonial", "brand": "Coral", "code": "5678" }
  ],
  "brandRestriction": null
}
```

**Resposta do cliente:**
```json
[
  { "hex": "#F44336", "name": "Vermelho Vivo", "brand": "Suvinil", "code": "1234" },
  { "hex": "#00FF00", "name": null, "brand": null, "code": null } // personalizada
]
```

## 5. Integração com Paletas Reais
- Importar JSONs públicos ou usar APIs das marcas para popular as opções.
- Armazenar localmente para busca rápida.
- Exibir nome, código, marca e amostra visual.

## 6. Benefícios
- Liberdade total para o cliente.
- Sugestões profissionais do arquiteto.
- Padronização e clareza para execução da obra.

---

> Documento base para implementação e validação do fluxo de seleção de cores em briefings de arquitetura/interiores.
