# 🎯 Deep Agent - Criador de Copy Persuasiva

Sistema inteligente multi-agente para criação de copies de alta conversão para o setor de construção e home improvement.

## 🚀 Visão Geral

Este sistema transforma um prompt simples em uma arquitetura sofisticada de 4 agentes especializados que replicam o processo de uma agência de copywriting especializada.

### ✨ Principais Diferenciais

- **Especialização Extrema**: Cada agente foca em sua expertise específica
- **Qualidade Superior**: Múltiplas camadas de análise e refinamento
- **Base de Conhecimento Validada**: 17 copies de alta conversão como referência
- **System Prompts Detalhados**: Instruções extremamente específicas para qualidade insana
- **Processo Estruturado**: Fluxo sequencial obrigatório para consistência

## 🏗️ Arquitetura do Sistema

```
[INPUT] → [Market Research] → [Hook Strategy] → [Copy Creation] → [Quality Assurance] → [OUTPUT FINAL]
```

### 🔬 Market Research Agent
- **Especialidade**: Análise aprofundada do mercado local
- **Input**: Nome do cliente, região, serviço
- **Output**: Relatório detalhado com personas específicas da região

### 🎣 Hook Strategy Agent
- **Especialidade**: Criação de hooks persuasivos baseados em psicologia
- **Input**: Insights de mercado + dados do cliente
- **Output**: 3 hooks estratégicos (Urgência, Autoridade, Benefício)

### ✍️ Copy Creation Agent
- **Especialidade**: Construção de copies de 30-40 segundos
- **Input**: Hooks + dados do cliente + base de conhecimento
- **Output**: 3 copies completas seguindo padrões validados

### 🔍 Quality Assurance Agent
- **Especialidade**: Auditoria e scoring das copies
- **Input**: 3 copies + critérios de qualidade
- **Output**: Scores detalhados + recomendações de melhoria

## 📋 Entrada Obrigatória

1. **Nome do cliente** - Empresa ou pessoa física
2. **Região de atuação** - Cidade/estado específico (não aceita genéricos)
3. **Serviço principal** - Tipo de construção/reforma
4. **Ofertas disponíveis** - Descontos, promoções, vantagens
5. **Telefone do cliente** - Para call-to-action
6. **Reviews Google** - Incluir ou não nas copies

## 🎯 Output Final

### Relatórios Gerados:
- **Análise de Mercado** - Demografia e personas específicas
- **Estratégia de Hooks** - 3 hooks com justificativas psicológicas
- **3 Copies Completas** - 30-40 segundos cada, estruturadas
- **Auditoria de Qualidade** - Scores de 1-10 para cada copy
- **Recomendações Estratégicas** - Quando usar cada copy

### Critérios de Aprovação:
- Scores médios ≥ 8.0/10
- Estrutura obrigatória respeitada
- Dados específicos da região
- Hooks com fundamento psicológico
- Timing adequado (30-40 segundos)

## 📊 Base de Conhecimento

### Validated Copies (17 exemplos)
- Copies testadas e validadas no setor
- Padrões de estrutura e timing
- Gatilhos psicológicos comprovados

### Fórmulas de Copywriting
- Estruturas core testadas (30-40 segundos)
- Gatilhos psicológicos comprovados
- Padrões de linguagem convertedora
- Métricas de timing ideais

### Templates de Market Research
- Framework de análise demográfica
- Templates de personas específicas
- Análise competitiva estruturada
- Insights comportamentais locais

## 🔥 Qualidade Extrema

### System Prompts Detalhados:
- **12.000+ tokens** de instruções específicas
- **Protocolos rigorosos** de execução
- **Critérios precisos** de validação
- **Checklists completos** para qualidade

### Validações Obrigatórias:
- ❌ REJEITAR se não seguir fluxo sequencial
- ❌ REJEITAR se dados não forem específicos da região
- ❌ REJEITAR se hooks não tiverem justificativa psicológica
- ❌ REJEITAR se copies não seguirem estrutura obrigatória
- ❌ REJEITAR se scores médios < 8.0/10

## 🚀 Como Usar

```typescript
import { copyCreatorAgent } from './copy-creator-agent.js';

const result = await copyCreatorAgent.invoke({
  messages: [{
    role: "user",
    content: `Crie copies para:
    Nome do cliente: João Silva Construções
    Região: São Paulo, SP
    Serviço: Instalação de pisos laminados
    Ofertas: 20% de desconto para os 10 primeiros
    Telefone: (11) 99999-9999
    Reviews Google: Sim, incluir`
  }]
});
```

## 📈 Resultados Esperados

- **Conversão Superior**: Copies baseadas em padrões validados
- **Relevância Local**: Insights específicos da região do cliente
- **Qualidade Consistente**: Process rigoroso de 4 etapas
- **Fundamentação Científica**: Hooks baseados em psicologia do consumidor
- **Execução Profissional**: Replica processo de agência especializada

## 🔄 SISTEMA DE REFINAMENTO ITERATIVO

### **Revolucionário: Feedback Específico = Processo Completo**

```typescript
// Depois das copies iniciais, você pode solicitar:
"não gostei da copy 3"
"refaça a segunda copy"
"a copy 1 precisa de mais urgência"
```

### **O que Acontece:**
1. **🔍 Re-executa TODO o processo** focado apenas na copy específica
2. **📁 Salva cada copy separadamente** (copy1.md, copy2.md, copy3.md)
3. **🧠 Repensar estratégia completa** em vez de ajustes superficiais
4. **📊 Score mais rigoroso** - copy refinada deve ter ≥9.0/10

### **Fluxo de Refinamento:**
```
Market Research → "Por que essa copy falhou?"
Hook Strategy   → "Que gatilho psicológico alternativo posso usar?"
Copy Creation   → "Como abordar isso de forma totalmente nova?"
Quality Assur.  → "A nova versão resolveu o problema?"
```

### **Arquivos Criados:**
```
copy1.md                # Copy Urgência/Escassez
copy2.md                # Copy Autoridade/Credibilidade
copy3.md                # Copy Benefício/Transformação
copy_report_final.md    # Compilação com recomendações
```

---

**Transforme informações básicas em copies de alta conversão com precisão cirúrgica, qualidade profissional e refinamento iterativo ilimitado.**