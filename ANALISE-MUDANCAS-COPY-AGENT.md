# 📋 Análise de Mudanças - Copy Creator Agent

## 📊 Estrutura Atual

### Arquitetura do Sistema
O Copy Creator Agent é um sistema multi-agente que funciona em **4 etapas sequenciais**:

```
[Input do Usuário]
    ↓
[Market Research Agent] - Análise de mercado e personas
    ↓
[Hook Strategy Agent] - Criação de 3 hooks estratégicos
    ↓
[Copy Creation Agent] - Geração de 3 copies de 30-40s
    ↓
[Quality Assurance Agent] - Auditoria e score (1-10)
    ↓
[Output Final] - Relatório completo em arquivos .md
```

### Tecnologias Utilizadas
- **Framework**: LangGraph (Deep Agents)
- **Modelo LLM**: Configurável (Gemini 1.5 Flash atual)
- **Modo de Execução**: **Streaming via LangGraph SDK**
- **Deploy**: Railway com endpoint `/copy-creator`
- **Arquivos**: Sistema de mock filesystem (state.files)

### Output Atual
O agente atualmente retorna:
- **Streaming de mensagens** do LLM
- **Arquivos salvos** no mock filesystem:
  - `original_question.txt`
  - `analyze_market.md`
  - `strategic_hooks.md`
  - `copy1.md`, `copy2.md`, `copy3.md` (3 fixas)
  - `quality_audit.md`
  - `copy_report_final.md`
- **Número fixo**: Sempre gera **3 copies**

---

## 🚨 Problemas Identificados

### 1. Streaming Indesejado
**Problema**: O agente retorna resposta em streaming (chunks de texto).
- **Arquivo**: `copy-creator-agent.ts:382-416`
- **Método**: `copyCreatorAgent.invoke()` retorna streaming por padrão do LangGraph
- **Impacto**: Cliente precisa processar stream, não pode receber resposta completa de uma vez

### 2. Output Não Estruturado
**Problema**: Retorna texto livre e arquivos .md, sem formato JSON estruturado.
- **Atual**: Arquivos markdown com copies em texto corrido
- **Necessário**: JSON estruturado com array de objetos
- **Exemplo esperado**:
```json
{
  "message": "Aqui estão as 5 copies geradas!",
  "type": "copies",
  "copies": [
    {
      "id": "copy-1",
      "order": 1,
      "content": "🏠 BRIEFING - CAMPANHA...",
      "created_at": "2025-10-02T10:00:00Z"
    },
    { ... }
  ]
}
```

### 3. Quantidade Fixa de Copies
**Problema**: Hardcoded para gerar sempre **3 copies**.
- **Arquivos afetados**:
  - `copy-creator-agent.ts:93` - Prompt menciona "3 final copies"
  - `copy-creation-agent.ts:54-75` - Estrutura fixa de 3 copies
  - `hook-strategy-agent.ts:20-24` - 3 hooks estratégicos fixos
  - `quality-assurance-agent.ts:64-88` - Auditoria de 3 copies
- **Necessário**: Receber parâmetro `n` (quantidade desejada) no input

### 4. Prompt Fixo
**Problema**: Prompts dos sub-agentes assumem 3 copies/hooks.
- **Copy Creation Agent**: "## 3 Complete Copies - [Client Name]"
- **Hook Strategy Agent**: "REQUIRED STRATEGIES: 1. Urgency/Scarcity Hook, 2. Authority/Credibility Hook, 3. Benefit/Transformation Hook"
- **Quality Assurance Agent**: "### Copy 1, Copy 2, Copy 3"

### 5. Falta Distinção de Tipos de Resposta
**Problema**: Não há diferenciação entre:
- Mensagens de interação normal ("olá", "falta tal dado")
- Output estruturado de copies geradas
- **Necessário**: Campo `type` para identificar tipo de resposta

---

## 🔧 Mudanças Necessárias

### 1. Remover Streaming ✅

#### Mudança no Código
**Arquivo**: `copy-creator-agent.ts`

**Antes**:
```typescript
const result = await copyCreatorAgent.invoke(input, {
  configurable: {
    timeout: 120000,
  }
});
// Retorna streaming
```

**Depois**:
```typescript
// Opção 1: Coletar todo o stream antes de retornar
const result = await copyCreatorAgent.invoke(input, {
  configurable: {
    timeout: 120000,
  }
});

// Aguardar processamento completo
const finalState = result; // Já retorna estado final, não stream

// Opção 2: Usar .stream() e coletar tudo
const stream = await copyCreatorAgent.stream(input);
let finalState;
for await (const chunk of stream) {
  finalState = chunk; // Acumula até o final
}
```

**Nota**: LangGraph `.invoke()` já retorna o estado final completo, não streaming. O streaming só ocorre se usar `.stream()` ou via API HTTP do LangGraph SDK.

---

### 2. Criar Structured Output ✅

#### Nova Interface TypeScript
**Criar arquivo**: `examples/research/types/copy-output.ts`

```typescript
export interface CopyObject {
  id: string;           // "copy-1", "copy-2", etc
  order: number;        // 1, 2, 3, ..., n
  content: string;      // Texto completo da copy
  created_at: string;   // ISO timestamp
  strategy?: string;    // "Urgency/Scarcity", "Authority/Credibility", etc
  score?: number;       // Score do QA Agent (8.5, 9.2, etc)
}

export interface CopyResponse {
  message: string;      // Mensagem para o usuário
  type: "copies" | "message" | "error" | "validation_error";
  copies?: CopyObject[];
  metadata?: {
    client_name?: string;
    region?: string;
    service?: string;
    total_copies: number;
  };
}
```

#### Modificar Agente para Retornar JSON Estruturado
**Arquivo**: `copy-creator-agent.ts`

Adicionar lógica de pós-processamento:

```typescript
async function invokeWithStructuredOutput(
  input: any,
  maxRetries = 3,
  delayMs = 2000
): Promise<CopyResponse> {

  const finalState = await invokeWithRetry(input, maxRetries, delayMs);

  // Verificar se há erro de validação (dados faltando)
  const lastMessage = finalState.messages?.slice(-1)[0]?.content || "";

  if (lastMessage.includes("preciso das seguintes informações")) {
    return {
      message: lastMessage,
      type: "validation_error"
    };
  }

  // Extrair copies dos arquivos mock filesystem
  const files = finalState.files || {};
  const copies: CopyObject[] = [];

  // Detectar quantas copies foram criadas
  let copyIndex = 1;
  while (files[`copy${copyIndex}.md`]) {
    const content = files[`copy${copyIndex}.md`];
    const qualityAudit = files['quality_audit.md'] || "";

    // Extrair score do quality audit (regex simples)
    const scoreMatch = qualityAudit.match(
      new RegExp(`Copy ${copyIndex}.*?Score: (\\d+\\.\\d+)/10`, 's')
    );
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : undefined;

    copies.push({
      id: `copy-${copyIndex}`,
      order: copyIndex,
      content: content.trim(),
      created_at: new Date().toISOString(),
      score
    });

    copyIndex++;
  }

  // Se encontrou copies, retornar estruturado
  if (copies.length > 0) {
    // Extrair dados do cliente
    const originalQuestion = files['original_question.txt'] || "";

    return {
      message: `Aqui estão as ${copies.length} copies geradas com sucesso!`,
      type: "copies",
      copies,
      metadata: {
        total_copies: copies.length
      }
    };
  }

  // Caso contrário, mensagem normal
  return {
    message: lastMessage,
    type: "message"
  };
}
```

---

### 3. Tornar Quantidade de Copies Variável ✅

#### Modificar Input do Usuário
**Arquivo**: `copy-creator-agent.ts`

Adicionar parâmetro `numberOfCopies` no input:

```typescript
interface CopyCreatorInput {
  clientName: string;
  region: string;
  service: string;
  offers: string;
  phoneNumber: string;
  includeGoogleReviews: boolean;
  numberOfCopies?: number; // Novo campo opcional (default: 3)
}

async function main() {
  const userInput: CopyCreatorInput = {
    clientName: "João Silva Construções",
    region: "São Paulo, SP",
    service: "Instalação de pisos laminados",
    offers: "20% de desconto para os 10 primeiros agendamentos",
    phoneNumber: "(11) 99999-9999",
    includeGoogleReviews: true,
    numberOfCopies: 5 // 🆕 Quantidade dinâmica
  };

  const result = await invokeWithStructuredOutput({
    messages: [{
      role: "user",
      content: formatInputMessage(userInput)
    }]
  });
}

function formatInputMessage(input: CopyCreatorInput): string {
  return `Crie ${input.numberOfCopies || 3} copies para:
Nome do cliente: ${input.clientName}
Região: ${input.region}
Serviço: ${input.service}
Ofertas: ${input.offers}
Telefone: ${input.phoneNumber}
Reviews Google: ${input.includeGoogleReviews ? 'Sim, incluir' : 'Não incluir'}`;
}
```

---

### 4. Atualizar Prompts dos Sub-Agentes ✅

#### Hook Strategy Agent
**Arquivo**: `agents/hook-strategy-agent.ts`

**Antes**:
```typescript
REQUIRED STRATEGIES:
1. Urgency/Scarcity Hook
2. Authority/Credibility Hook
3. Benefit/Transformation Hook
```

**Depois**:
```typescript
REQUIRED STRATEGIES:
You must create **{N} strategic hooks** based on the number of copies requested.

**Hook Distribution Logic**:
- If N ≤ 3: Use the 3 core strategies (Urgency/Scarcity, Authority/Credibility, Benefit/Transformation)
- If N > 3: Expand with variations:
  - Urgency/Scarcity (multiple angles)
  - Authority/Credibility (different credentials)
  - Benefit/Transformation (different benefits)
  - Problem/Solution
  - Social Proof
  - Limited Offer
  - etc.

**Important**: The number of hooks MUST match the number of copies requested (N).
```

#### Copy Creation Agent
**Arquivo**: `agents/copy-creation-agent.ts`

**Antes**:
```typescript
OUTPUT FORMAT:
## 3 Complete Copies - [Client Name]

### Copy 1: [Hook Strategy]
### Copy 2: [Hook Strategy]
### Copy 3: [Hook Strategy]
```

**Depois**:
```typescript
OUTPUT FORMAT:
## {N} Complete Copies - [Client Name]

Create **exactly {N} copies** as requested by the user.

For each copy (from 1 to N):
### Copy {i}: [Hook Strategy]
**Duration:** 30-40 seconds
**Hook Used:** [Strategy name]
**Copy:**
"[Complete copy text]"

**CRITICAL**:
- Save each copy in a separate file: copy1.md, copy2.md, ..., copy{N}.md
- Each copy must use a unique hook strategy from the Hook Strategy Agent
```

#### Quality Assurance Agent
**Arquivo**: `agents/quality-assurance-agent.ts`

**Antes**:
```typescript
REQUIRED INPUT:
- 3 complete copies from the Copy Creation Agent
```

**Depois**:
```typescript
REQUIRED INPUT:
- {N} complete copies from the Copy Creation Agent (where N is the number requested)

EVALUATION:
Audit ALL copies created (from copy1.md to copy{N}.md).

For each copy:
### Copy {i}: [Strategy]
**Total Score: X.X/10**
[Detailed evaluation]

## Final Ranking and Recommendations
Rank ALL {N} copies by performance.
```

#### Agente Principal (Orchestrator)
**Arquivo**: `copy-creator-agent.ts`

Adicionar ao prompt principal:

```typescript
const copyCreatorInstructions = `# SPECIALIST AGENT IN CREATING PERSUASIVE COPY

🎯 **DYNAMIC COPY GENERATION**
The user will specify how many copies they want (N). This number can be:
- Minimum: 1 copy
- Maximum: 10 copies (recommended limit)
- Default: 3 copies (if not specified)

**MANDATORY FLOW**:
1. Extract the NUMBER OF COPIES (N) from user input
2. Pass this number to ALL sub-agents
3. Ensure Market Research → Hook Strategy → Copy Creation → QA all respect N
4. Save N individual files: copy1.md, copy2.md, ..., copy{N}.md

... [resto do prompt] ...

### STEP 2: HOOK STRATEGY (Hook Strategy Agent)
**OBJECTIVE:** Create **N strategic hooks** based on market insights.

**INPUTS FOR THE AGENT:**
- Number of copies requested: {N}
- COMPLETE report from Market Research Agent
- All client information

**EXPECTED OUTPUTS:**
{N} strategic hooks (one for each copy)

### STEP 3: COPY CREATION (Copy Creation Agent)
**OBJECTIVE:** Build **{N} complete** 30-40 second copies.

**INPUTS FOR THE AGENT:**
- {N} validated strategic hooks
- Number of copies: {N}
- All client data

**VALIDATION:** EXACTLY {N} copies must be created and saved.
`;
```

---

### 5. Adicionar Validação de Input ✅

**Arquivo**: `copy-creator-agent.ts`

Adicionar validação no início do prompt principal:

```typescript
**STEP 1: VALIDATE REQUIRED DATA + NUMBER OF COPIES**

**CHECK IF ALL 7 REQUIRED DATA POINTS ARE PROVIDED:**
- Client name ✓
- Region (city/state) ✓
- Service type ✓
- Available offers ✓
- Phone number ✓
- Google reviews preference ✓
- **Number of copies (N)** ✓ (default: 3 if not specified)

**VALIDATION RULES FOR N:**
- If N is not specified, use N = 3 (default)
- If N < 1, return error: "Número mínimo de copies é 1"
- If N > 10, return warning: "Recomendado máximo de 10 copies, mas processarei {N}"

**IF ALL DATA IS COMPLETE:**
Execute tools with the number N in context.

**IF DATA IS INCOMPLETE:**
Respond in Portuguese asking for missing information. DO NOT execute tools.
```

---

### 6. Criar Wrapper de API (Opcional) ✅

Se você quiser uma API REST personalizada (não apenas LangGraph SDK):

**Criar arquivo**: `examples/research/api-server.ts`

```typescript
import express from 'express';
import { invokeWithStructuredOutput } from './copy-creator-agent.js';
import type { CopyCreatorInput, CopyResponse } from './types/copy-output.js';

const app = express();
app.use(express.json());

app.post('/api/generate-copies', async (req, res) => {
  try {
    const input: CopyCreatorInput = req.body;

    // Validação básica
    if (!input.clientName || !input.region || !input.service) {
      return res.status(400).json({
        message: "Campos obrigatórios: clientName, region, service",
        type: "error"
      });
    }

    // Invocar agente com structured output
    const result: CopyResponse = await invokeWithStructuredOutput({
      messages: [{
        role: "user",
        content: formatInputMessage(input)
      }]
    });

    // Retornar JSON estruturado (NÃO streaming)
    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: `Erro ao gerar copies: ${error.message}`,
      type: "error"
    });
  }
});

app.listen(3000, () => {
  console.log('🚀 API rodando em http://localhost:3000');
});
```

---

## 📦 Resumo das Mudanças

### Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `copy-creator-agent.ts` | ✅ Adicionar `invokeWithStructuredOutput()`<br>✅ Extrair copies do filesystem<br>✅ Retornar JSON ao invés de streaming<br>✅ Validar input com numberOfCopies |
| `types/copy-output.ts` | ✅ **CRIAR** interfaces `CopyObject` e `CopyResponse` |
| `copy-creation-agent.ts` | ✅ Atualizar prompt para aceitar {N} copies<br>✅ Loop dinâmico ao invés de 3 fixas |
| `hook-strategy-agent.ts` | ✅ Criar {N} hooks ao invés de 3 fixos |
| `quality-assurance-agent.ts` | ✅ Auditar {N} copies dinamicamente |
| `api-server.ts` (opcional) | ✅ **CRIAR** se quiser API REST customizada |

### Fluxo Final Esperado

```
1. Cliente envia POST com:
   {
     "clientName": "João Silva",
     "region": "São Paulo, SP",
     "service": "Pisos laminados",
     "offers": "20% off",
     "phoneNumber": "(11) 99999-9999",
     "includeGoogleReviews": true,
     "numberOfCopies": 5  // 🆕 Dinâmico
   }

2. Agente processa (SEM streaming)

3. Retorna JSON estruturado:
   {
     "message": "Aqui estão as 5 copies geradas!",
     "type": "copies",
     "copies": [
       {
         "id": "copy-1",
         "order": 1,
         "content": "If you live in São Paulo...",
         "created_at": "2025-10-02T10:00:00Z",
         "strategy": "Urgency/Scarcity",
         "score": 9.2
       },
       { ... } // + 4 copies
     ],
     "metadata": {
       "client_name": "João Silva",
       "total_copies": 5
     }
   }

4. Para interações normais (ex: "olá"):
   {
     "message": "Olá! Como posso ajudar...",
     "type": "message"
   }

5. Para erros de validação:
   {
     "message": "Para criar suas copies, preciso de: [lista]",
     "type": "validation_error"
   }
```

---

## ⚠️ Considerações Importantes

### Performance
- Gerar **N copies** aumenta tempo de execução linearmente
- **Recomendação**: Limite de 10 copies por request
- **Timeout**: Ajustar para `timeout: N * 30000` (30s por copy)

### Qualidade
- Com N > 3, hooks podem começar a repetir estratégias
- **Solução**: Hook Strategy Agent deve criar variações criativas

### Fallback
- Se agente falhar em criar exatamente N copies, retornar quantas conseguiu + warning:
```json
{
  "message": "Foram geradas 4 de 5 copies solicitadas",
  "type": "copies",
  "copies": [...],
  "metadata": {
    "requested": 5,
    "generated": 4,
    "warning": "Uma copy não passou no QA mínimo"
  }
}
```

---

## ✅ Próximos Passos

1. **Aprovar esta análise** ✋
2. Implementar interfaces TypeScript (`copy-output.ts`)
3. Modificar prompts dos sub-agentes (hooks, creation, QA)
4. Implementar `invokeWithStructuredOutput()` no agente principal
5. Testar com N = 1, 3, 5, 10
6. Validar output JSON estruturado
7. Deploy no Railway
