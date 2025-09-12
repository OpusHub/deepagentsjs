# Análise Deep Agent - Criador de Copy Persuasiva

## Situação Atual

### Prompt Simples Existente
O prompt atual (`prompt-exemplo-copy-creater.md`) utiliza uma abordagem monolítica onde um único agente:
- Coleta 5 informações básicas do cliente
- Gera uma copy baseada em padrões pré-definidos
- Cria 3 variações apenas mudando o hook
- Aplica fórmulas de persuasão de forma generalizada

### Limitações da Abordagem Atual
1. **Falta de Especialização**: Um agente tentando fazer tudo resulta em outputs genéricos
2. **Análise Superficial**: Não há análise profunda do público-alvo específico da região
3. **Hooks Limitados**: Variações superficiais sem estratégia diferenciada
4. **Sem Validação**: Não há processo de refinamento ou validação das copies geradas

## Proposta de Arquitetura Deep Agent

### Estrutura de Multi-Agentes Especializados

#### 1. **Market Research Agent** (Agente de Pesquisa de Mercado)
**Responsabilidade**: Análise aprofundada do mercado local e público-alvo
- Analisa dados demográficos da região especificada
- Identifica padrões de comportamento de homeowners locais
- Mapeia concorrência e posicionamento de mercado
- Define personas específicas para a região

**Input**: Nome do cliente, região, serviço
**Output**: Relatório detalhado do mercado local e personas

#### 2. **Hook Strategy Agent** (Agente de Estratégia de Hooks)
**Responsabilidade**: Criação de hooks estratégicos e diferenciados
- Utiliza insights do Market Research Agent
- Cria 3 estratégias distintas de hook (Urgência/Escassez, Autoridade/Credibilidade, Benefício/Transformação)
- Adapta linguagem para cada persona identificada
- Testa diferentes ângulos psicológicos

**Input**: Relatório de mercado, dados do cliente
**Output**: 3 hooks estratégicos com justificativas

#### 3. **Copy Creation Agent** (Agente de Criação de Copy)
**Responsabilidade**: Construção da copy persuasiva
- Utiliza base de conhecimento das 17 copies validadas
- Aplica frameworks de copywriting (AIDA, PAS, etc.)
- Integra ofertas de forma orgânica e persuasiva
- Mantém tom e linguagem consistentes

**Input**: Hooks estratégicos, dados do cliente, ofertas
**Output**: 3 versões completas da copy

#### 4. **Quality Assurance Agent** (Agente de Controle de Qualidade)
**Responsabilidade**: Validação e refinamento das copies
- Verifica aderência às fórmulas testadas
- Analisa força persuasiva de cada versão
- Garante que todas as informações obrigatórias estão presentes
- Sugere melhorias pontuais

**Input**: 3 versões da copy
**Output**: Versões refinadas com score de qualidade

### Fluxo de Trabalho do Deep Agent

```
[Input do Usuário] → [Market Research Agent] → [Hook Strategy Agent] → [Copy Creation Agent] → [Quality Assurance Agent] → [Output Final]
```

## Implementação Técnica

### Estrutura de Arquivos Recomendada

```
copy-creator/
├── agents/
│   ├── market-research-agent.ts
│   ├── hook-strategy-agent.ts  
│   ├── copy-creation-agent.ts
│   └── quality-assurance-agent.ts
├── knowledge-base/
│   ├── validated-copies.md (base-copys.md)
│   ├── copywriting-formulas.md
│   └── market-data-templates.md
├── prompts/
│   ├── market-research-instructions.md
│   ├── hook-strategy-instructions.md
│   ├── copy-creation-instructions.md
│   └── quality-assurance-instructions.md
└── copy-creator-main-agent.ts
```

### Principais Benefícios da Abordagem Deep Agent

1. **Especialização**: Cada agente foca em sua expertise específica
2. **Qualidade Superior**: Múltiplas camadas de análise e refinamento
3. **Consistência**: Base de conhecimento centralizada e validada
4. **Escalabilidade**: Fácil adição de novos agentes especializados
5. **Rastreabilidade**: Cada etapa do processo é documentada

### Prompts Especializados por Agente

#### Market Research Agent Instructions
```markdown
Você é um especialista em análise de mercado para o setor de construção e home improvement.
Sua única responsabilidade é analisar o mercado local e criar personas detalhadas.

ENTRADA:
- Nome do cliente
- Região de atuação  
- Tipo de serviço

SAÍDA OBRIGATÓRIA:
- Análise demográfica da região
- 2-3 personas principais de homeowners
- Insights sobre concorrência local
- Recomendações de posicionamento
```

#### Hook Strategy Agent Instructions  
```markdown
Você é um especialista em psicologia do consumidor e criação de hooks persuasivos.
Use APENAS os insights do Market Research Agent para criar hooks estratégicos.

ESTRATÉGIAS OBRIGATÓRIAS:
1. Hook de Urgência/Escassez
2. Hook de Autoridade/Credibilidade  
3. Hook de Benefício/Transformação

Para cada hook, forneça:
- Texto do hook
- Justificativa psicológica
- Persona-alvo específica
```

#### Copy Creation Agent Instructions
```markdown
Você é um copywriter expert treinado com 17 copies validadas de alta conversão.
Crie copies de 30-40 segundos seguindo EXATAMENTE os padrões das copies de referência.

ESTRUTURA OBRIGATÓRIA:
- Hook (fornecido pelo Hook Strategy Agent)
- Identificação do problema/oportunidade
- Apresentação da solução
- Oferta (se fornecida)
- Autoridade/credibilidade
- Urgência/escassez
- Call-to-action claro

Use as fórmulas validadas das 17 copies de referência.
```

#### Quality Assurance Agent Instructions
```markdown
Você é um auditor de copy que garante a qualidade final.
Analise cada copy e forneça score de 1-10 para:

CRITÉRIOS DE AVALIAÇÃO:
- Aderência aos padrões das copies validadas (peso 30%)
- Força do hook e engajamento inicial (peso 25%)  
- Clareza da oferta e call-to-action (peso 20%)
- Elementos de urgência/escassez (peso 15%)
- Credibilidade e autoridade (peso 10%)

Sugira melhorias específicas para scores abaixo de 8.
```

### Configuração do Agente Principal

```typescript
const copyCreatorAgent = createDeepAgent({
  tools: [internetSearch, localMarketData],
  instructions: mainCopyCreatorInstructions,
  subagents: [
    marketResearchAgent,
    hookStrategyAgent, 
    copyCreationAgent,
    qualityAssuranceAgent
  ]
}).withConfig({ recursionLimit: 1000 });
```

## Resultado Esperado

Com esta arquitetura, o output final será:

1. **Relatório de Análise de Mercado**
2. **3 Copies Completas** com hooks estratégicos diferentes
3. **Justificativas** para cada escolha criativa
4. **Scores de Qualidade** para cada versão
5. **Recomendações** de qual copy usar em cada contexto

Esta abordagem transforma um prompt simples em um sistema inteligente que replica o processo de uma agência de copywriting especializada, garantindo outputs consistentemente de alta qualidade.