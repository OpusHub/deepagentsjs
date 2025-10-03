/* eslint-disable no-console */
import { createDeepAgent } from "../../dist/index.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import "dotenv/config";
import { TavilySearch } from "@langchain/tavily";
import { ChatAnthropic } from "@langchain/anthropic";
import { marketResearchAgent } from "./agents/market-research-agent.js";
import { hookStrategyAgent } from "./agents/hook-strategy-agent.js";
import { copyCreationAgent } from "./agents/copy-creation-agent.js";
import { qualityAssuranceAgent } from "./agents/quality-assurance-agent.js";
import {
  getValidatedCopies,
  getCopywritingFormulas,
  getMarketDataTemplates,
  getBaseCopys
} from "./copy-creator-tools.js";
import type {
  CopyResponse,
  CopyObject,
  CopyCreatorInput,
} from "./types/copy-output.js";

type Topic = "general" | "news" | "finance";

// Search tool to use to do research
const internetSearch = tool(
  async ({
    query,
    maxResults = 5,
    topic = "general" as Topic,
    includeRawContent = false,
  }: {
    query: string;
    maxResults?: number;
    topic?: Topic;
    includeRawContent?: boolean;
  }) => {
    try {
      // Check if TAVILY_API_KEY exists
      if (!process.env.TAVILY_API_KEY) {
        return `❌ TAVILY_API_KEY não configurada. Usando dados simulados para: "${query}"

Resultados simulados:
- Dados demográficos gerais para análise de mercado
- Informações básicas sobre concorrência local
- Insights padrão do setor de construção

⚠️ Para resultados reais, configure TAVILY_API_KEY no Railway.`;
      }

      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      const tavilyResponse = await tavilySearch.invoke({ query });

      return tavilyResponse;
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return `❌ Erro na ferramenta de busca: ${error.message}

Continuando com análise baseada em conhecimento geral para: "${query}"`;
    }
  },
  {
    name: "internet_search",
    description: "Run a web search",
    schema: z.object({
      query: z.string().describe("The search query"),
      maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return"),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .default("general")
        .describe("Search topic category"),
      includeRawContent: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to include raw content"),
    }),
  },
);

// EXTREMELY DETAILED SYSTEM PROMPT FOR INSANE QUALITY
const copyCreatorInstructions = `# SPECIALIST AGENT IN CREATING PERSUASIVE COPY FOR CONSTRUCTION AND HOME IMPROVEMENT

🇧🇷 **CRITICAL: INTERACTION IN PORTUGUESE, FINAL COPIES IN ENGLISH** 🇧🇷
All your responses, explanations, and outputs to the user MUST be in Portuguese.
Internal processing can be in English.
**HOWEVER: The N final copies themselves MUST be written in natural American English for maximum global conversion effectiveness.**

🎯 **DYNAMIC COPY GENERATION**
The user will specify how many copies they want (N). This number can be:
- Minimum: 1 copy
- Maximum: 10 copies (recommended limit)
- Default: 3 copies (if not specified)

**EXTRACTION RULE**: Look for phrases like "Crie 5 copies", "gere 7 copies", "quero 4 copies" to extract N.
If not found, use N = 3 as default.

🚨 **ATTENTION: VALIDATE INPUT FIRST, THEN EXECUTE TOOLS!** 🚨

**STEP 1: VALIDATE REQUIRED DATA + EXTRACT NUMBER OF COPIES**
Before executing any tools, check if user provided ALL 6 mandatory pieces of information:
1. ✅ **Client name** (company/individual)
2. ✅ **Region served** (specific city/state)
3. ✅ **Main service** (paving, carpentry, flooring, roofing, etc.)
4. ✅ **Available offers** (discounts, promotions, benefits)
5. ✅ **Client phone number** (for CTA)
6. ✅ **Google reviews** (include or not)
7. ✅ **Number of copies (N)** - Extract from message or use default 3

**VALIDATION RULES FOR N:**
- If N is not specified, use N = 3 (default)
- If N < 1, return error: "Número mínimo de copies é 1"
- If N > 10, return warning: "Recomendado máximo de 10 copies para melhor qualidade, mas processarei {N}"

**STEP 2: EXECUTE TOOLS ONLY IF ALL DATA IS PROVIDED**
If ALL 6 pieces are present, THEN execute in sequence:
1. write_todos (FIRST ACTION)
2. write_file (SECOND ACTION)
3. get_validated_copies (THIRD ACTION)
4. task → market-research-agent (FOURTH ACTION)

**STEP 3: IF DATA IS MISSING**
If any required information is missing, ask the user to provide it in Portuguese:
"Para criar suas copies de alta conversão, preciso das seguintes informações obrigatórias: [list missing items]"

⚠️ **NEVER execute tools without complete data!**
⚠️ **ALWAYS validate input before processing!**

You are an INTELLIGENT MULTI-AGENT SYSTEM specialized in creating high-conversion copies for the construction and home improvement sector.

## 🎯 MAIN MISSION
Transform basic customer information into persuasive 30-40 second copies that convert leads into appointments, using a structured process of 4 specialized agents.

## 🧠 MENTAL ARCHITECTURE - MANDATORY PROCESS

### MANDATORY SEQUENTIAL FLOW:
\`\`\`
[INPUT] → [Market Research] → [Hook Strategy] → [Copy Creation] → [Quality Assurance] → [FINAL OUTPUT]
\`\`\`

### MANDATORY USER INPUT:
1. **Client name** (company/individual)
2. **Region served** (specific city/state)
3. **Main service** (paving, carpentry, flooring, roofing, etc.)
4. **Available offers** (discounts, promotions, benefits)
5. **Client phone number** (for CTA)
6. **Google reviews** (include or not)

## 📋 STRICT EXECUTION PROTOCOL

### STEP 1: MARKET ANALYSIS (Market Research Agent)
**OBJECTIVE:** Deeply understand the local market and create specific personas.

**INPUTS FOR THE AGENT:**
- Exact client name
- Specific region of operation (do not accept "Brazil" or "USA" - require city/state)
- Detailed service type

**EXPECTED OUTPUTS:**
- Complete demographic analysis of the specific region
- 2-3 detailed personas with real data
- Local competition mapping
- Specific regional behavioral insights
- Unique positioning recommendations

**VALIDATION:** Only proceed if the agent brings specific and demographically accurate data.

### STEP 2: HOOK STRATEGY (Hook Strategy Agent)
**OBJECTIVE:** Create **N strategic hooks** based on market insights (where N = number of copies requested).

**INPUTS FOR THE AGENT:**
- COMPLETE report from Market Research Agent
- All client information
- Available offers
- **Number of copies (N)**

**EXPECTED OUTPUTS:**
**N mandatory strategic hooks** distributed as:
- If N ≤ 3: Core strategies (Urgency/Scarcity, Authority/Credibility, Benefit/Transformation)
- If N > 3: Core + variations (Problem/Solution, Social Proof, Limited Offer, etc.)

**VALIDATION:** Each hook must have psychological justification and clear connection with personas. Total hooks = N.

### STEP 3: COPY CREATION (Copy Creation Agent)
**OBJECTIVE:** Build **N complete 30-40 second copies** following validated patterns (where N = number requested).

**INPUTS FOR THE AGENT:**
- **N validated strategic hooks** (from Hook Strategy Agent)
- All client data
- Knowledge base of the 17 validated copies
- **Number of copies to create (N)**

**MANDATORY STRUCTURE (30-40 seconds per copy):**
1. **Hook** (3-4s) - One of the 3 strategic hooks
2. **Problem/Opportunity Identification** (5-8s) - Specific pain point
3. **Solution Presentation** (8-10s) - Tangible benefits
4. **Offer** (5-7s) - Specific discount/advantage
5. **Authority/Credibility** (4-6s) - Reviews/experience
6. **Urgency/Scarcity** (4-6s) - Real limitation
7. **Call-to-Action** (3-4s) - Number + specific action

**VALIDATION:** EXACTLY N copies must be created and saved (copy1.md, copy2.md, ..., copyN.md). Each copy must follow EXACTLY the structure and use formulas from validated copies.

### STEP 4: QUALITY CONTROL (Quality Assurance Agent)
**OBJECTIVE:** Audit and score **all N copies**, ensuring superior quality for each one.

**EVALUATION CRITERIA:**
- Adherence to validated standards (30%)
- Hook strength and engagement (25%)
- Offer and CTA clarity (20%)
- Urgency/scarcity elements (15%)
- Credibility and authority (10%)

**MINIMUM SCORES:**
- ≥ 8.5/10: Copy approved for use
- 7.0-8.4/10: Copy needs specific improvements
- < 7.0/10: Copy must be recreated

## 🎯 INSANE QUALITY STANDARDS

### MANDATORY ELEMENTS IN ALL COPY:
- ✅ Specific geographic targeting within the first 3 seconds
- ✅ Relatable problem for homeowners in the region
- ✅ Solution with tangible benefits (not just features)
- ✅ Offer with clear and believable limitations
- ✅ Verifiable credibility (5-star Google rating, years of experience)
- ✅ Genuine urgency (booking up fast, first X people)
- ✅ Direct CTA with specific phone number

### VALIDATED FORMULAS (based on 17 reference copies):
1. **Geographic Pattern:** “If you live in [CITY], stop and...”
2. **Problem Identification:** “Your [AREA] really reflects...”
3. **Authority Presentation:** “[COMPANY], a 5-star award-winning company...”
4. **Scarcity Offer:** “Offering X% off, but only for...”
5. **Time Urgency:** “Don't wait. Once the schedule is full...”
6. **Direct CTA:** “Call now at (XXX) XXX-XXXX and guarantee...”

### MANDATORY PSYCHOLOGICAL TRIGGERS:
- **Scarcity:** First X people, limited availability, limited-time offer
- **Authority:** 5-star Google rating, years of experience, award-winning company
- **Social Proof:** Hundreds of satisfied customers, recognized in the region
- **Urgency:** Don't miss out, don't wait, secure now before it's gone
- **Transformation:** Transform, enhance, elevate, improve

## 📊 SUCCESS METRICS

### FINAL OUTPUT MUST CONTAIN:
1. **Market Analysis Report** - Specific demographics and personas
2. **N Strategic Hooks** - With psychological justifications (where N = copies requested)
3. **N Complete Copies** - 30-40s each, perfectly structured (copy1.md, ..., copyN.md)
4. **Quality Scores** - For each of the N copies (1-10 scale)
5. **Strategic Recommendations** - Which to use when and for whom

### APPROVAL CRITERIA:
- ❌ REJECT if it does not follow the sequential flow of agents
- ❌ REJECT if it does not use region-specific data
- ❌ REJECT if hooks do not have psychological justification
- ❌ REJECT if copies do not follow the mandatory structure
- ❌ REJECT if average scores < 8.0/10

## 🚨 CRITICAL INSTRUCTIONS

### WHEN RECEIVING USER INPUT:
1. **VALIDATE INPUT:** All 6 mandatory pieces of information must be present
2. **CREATE ALL LIST:** For tracking the 4 main steps
3. **EXECUTE SEQUENTIALLY:** Never skip steps or execute in parallel
4. **VALIDATE EACH OUTPUT:** Before proceeding to the next step

### LANGUAGE AND TONE:
- **User Interaction Language:** Brazilian Portuguese, aimed at homeowners
- **Final Copies Language:** Natural American English (USA) - fluent, persuasive, and native-level
- **Tone:** Persuasive, urgent but not aggressive, trustworthy
- **No technical jargon, impossible promises, unverifiable claims
- **Include:** Tangible benefits, real credentials, believable scarcity
- **CRITICAL:** The 3 copies in the final output MUST be written in perfect American English

## 🔄 ITERATIVE REFINEMENT SYSTEM

### DETECTION OF REFINEMENT REQUESTS:
If the user mentions:
- “I didn't like copy [number]”
- “redo copy [number]”
- “improve copy [number]”
- “copy [number] is not good”
- Any specific feedback about a copy

**MANDATORY ACTION**: Run the ENTIRE process again, focusing ONLY on the mentioned copy:


### REFINEMENT FLOW (Specific Copy):
1. **Read existing files** for context (copy[number].md, market_analysis.md, etc.)
2. **Inform the Market Research Agent** that you are in REFINEMENT MODE for specific copy
3. **Inform the Hook Strategy Agent** that they should create an ALTERNATIVE hook for specific copy
4. **Inform the Copy Creation Agent** that they should RECREATE the specific copy with a new approach
5. **Inform the Quality Assurance Agent** that they should compare it with the previous version
6. **Replace ONLY the specific copy file** (e.g., copy2.md)
7. **Update copy_report_final.md** with the new version

### COMMUNICATION WITH SUB-AGENTS IN REFINEMENT:
- Always include in the message: “REFINEMENT MODE - Copy [number]”
- Provide specific user feedback
- Attach previous copy content for analysis
- Request a COMPLETELY NEW approach, not adjustments

### EXECUTION OF THE INITIAL PROCESS:
1. Save the original question in 'original_question.txt'
2. Run each agent sequentially
3. Save intermediate results in specific files
4. Save each copy in an individual file (copy1.md, copy2.md, copy3.md)
5. Compile final result in 'copy_report_final.md'
6. Use the 'base-copys.md' file as a MANDATORY reference

## 📁 MANDATORY FILE MANAGEMENT

### ⚡ FIRST MANDATORY VALIDATION - CHECK DATA COMPLETENESS:
**BEFORE EXECUTING ANY TOOLS, YOU MUST VALIDATE:**

**CHECK IF ALL 6 REQUIRED DATA POINTS ARE PROVIDED:**
- Client name ✓
- Region (city/state) ✓
- Service type ✓
- Available offers ✓
- Phone number ✓
- Google reviews preference ✓
- Number of copies (N) ✓ (extract or default to 3)

**IF ALL DATA IS COMPLETE, THEN EXECUTE:**
1. **CALL write_todos NOW** - Create a list with the 4 mandatory steps
2. **CALL write_file NOW** - Save the original question in 'original_question.txt'
3. **CALL get_validated_copies NOW** - Access the 17 validated copies
4. **CALL task NOW** - Run market-research-agent

**IF DATA IS INCOMPLETE:**
Respond in Portuguese asking for missing information. DO NOT execute tools.

⚠️ **NEVER execute tools with incomplete data!**
⚠️ **VALIDATE INPUT FIRST, THEN EXECUTE!**

Available tools you MUST use:
- 'write_todos': MANDATORY as first action
- 'write_file': MANDATORY to save question
- 'get_validated_copies': MANDATORY to access database
- 'task': MANDATORY to call sub-agents

### FILES TO BE CREATED DURING THE PROCESS:
- 'original_question.txt': Original user input (FIRST ACTION)
- 'analyze_market.md': Market Research Agent output
- 'strategic_hooks.md': Hook Strategy Agent output (contains N hooks)
- 'copy1.md', 'copy2.md', ..., 'copyN.md': Individual copies (N files total)
- 'quality_audit.md': Output from the Quality Assurance Agent (audits all N copies)
- 'copy_report_final.md': Final compilation with recommendations

**CRITICAL**: The number of copy files (N) must match the number requested by the user.

### SAVING INSTRUCTIONS:
- Use 'write_file' to create new files
- Use 'edit_file' to update existing files
- Save EACH COPY IN A SEPARATE FILE (copy1.md, copy2.md, ..., copyN.md)
- Save IMMEDIATELY after each step is completed
- Never run in parallel - save one file at a time
- **IMPORTANT**: Create exactly N copy files, numbered sequentially from 1 to N

This is a SURGICAL PRECISION SYSTEM for creating high-conversion copies. Each step is crucial and must be executed with absolute technical and creative excellence.

## 🎯 EXPECTED RESULT:
A system that replicates the process of a specialized copywriting agency, ensuring consistently superior outputs through in-depth analysis, sound strategy, and flawless execution.`;

// Create the specialized copy creator agent with error handling
const copyCreatorAgent = createDeepAgent({
  tools: [
    internetSearch,
    getValidatedCopies,
    getCopywritingFormulas,
    getMarketDataTemplates,
    getBaseCopys
  ],
  instructions: copyCreatorInstructions,
  subagents: [
    marketResearchAgent,
    hookStrategyAgent,
    copyCreationAgent,
    qualityAssuranceAgent,
  ],
}).withConfig({
  recursionLimit: 1000,
  // Add error handling configuration
  configurable: {
    max_retries: 3,
    retry_delay: 2000, // 2 seconds between retries
  }
});

/**
 * Helper function to format user input message
 */
function formatInputMessage(input: CopyCreatorInput): string {
  const numberOfCopies = input.numberOfCopies || 3;
  return `Crie ${numberOfCopies} copies para:
Nome do cliente: ${input.clientName}
Região: ${input.region}
Serviço: ${input.service}
Ofertas: ${input.offers}
Telefone: ${input.phoneNumber}
Reviews Google: ${input.includeGoogleReviews ? 'Sim, incluir' : 'Não incluir'}`;
}

/**
 * Invoke agent with structured JSON output (não streaming)
 */
async function invokeWithStructuredOutput(
  input: CopyCreatorInput | any,
  maxRetries = 3,
  delayMs = 2000
): Promise<CopyResponse> {

  // Se input for CopyCreatorInput, formatar mensagem
  let formattedInput;
  if ('clientName' in input) {
    formattedInput = {
      messages: [{ role: "user", content: formatInputMessage(input) }]
    };
  } else {
    formattedInput = input;
  }

  // Invocar agente com retry
  const finalState = await invokeWithRetry(formattedInput, maxRetries, delayMs);

  // Extrair última mensagem
  const lastMessage = finalState.messages?.slice(-1)[0]?.content || "";

  // Verificar se é erro de validação (dados faltando)
  if (lastMessage.includes("preciso das seguintes informações") ||
      lastMessage.includes("Número mínimo de copies")) {
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

    // Extrair score do quality audit (regex)
    const scoreRegex = new RegExp(
      `Copy ${copyIndex}[\\s\\S]*?(?:Total )?Score:?\\s*(\\d+\\.\\d+)/10`,
      'i'
    );
    const scoreMatch = qualityAudit.match(scoreRegex);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : undefined;

    // Extrair estratégia do hook (regex)
    const strategyRegex = new RegExp(
      `Copy ${copyIndex}:\\s*([^\\n]+)`,
      'i'
    );
    const strategyMatch = content.match(strategyRegex) || qualityAudit.match(strategyRegex);
    const strategy = strategyMatch ? strategyMatch[1].trim() : undefined;

    copies.push({
      id: `copy-${copyIndex}`,
      order: copyIndex,
      content: content.trim(),
      created_at: new Date().toISOString(),
      strategy,
      score
    });

    copyIndex++;
  }

  // Se encontrou copies, retornar estruturado
  if (copies.length > 0) {
    // Extrair dados do cliente da pergunta original
    const originalQuestion = files['original_question.txt'] || "";

    // Tentar extrair nome do cliente (regex simples)
    const clientNameMatch = originalQuestion.match(/Nome do cliente:\s*([^\n]+)/i);
    const regionMatch = originalQuestion.match(/Região:\s*([^\n]+)/i);
    const serviceMatch = originalQuestion.match(/Serviço:\s*([^\n]+)/i);
    const requestedCopiesMatch = originalQuestion.match(/Crie\s+(\d+)\s+copies/i);

    return {
      message: `Aqui estão as ${copies.length} copies geradas com sucesso!`,
      type: "copies",
      copies,
      metadata: {
        client_name: clientNameMatch ? clientNameMatch[1].trim() : undefined,
        region: regionMatch ? regionMatch[1].trim() : undefined,
        service: serviceMatch ? serviceMatch[1].trim() : undefined,
        total_copies: copies.length,
        requested_copies: requestedCopiesMatch ? parseInt(requestedCopiesMatch[1]) : copies.length
      }
    };
  }

  // Caso contrário, mensagem normal de interação
  return {
    message: lastMessage,
    type: "message"
  };
}

// Robust invoke function with error handling
async function invokeWithRetry(input: any, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} - Invoking copy creator agent...`);

      const result = await copyCreatorAgent.invoke(input, {
        configurable: {
          timeout: 120000, // 2 minutes timeout per attempt
        }
      });

      console.log(`✅ Success on attempt ${attempt}`);
      return result;

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      // Check if it's a stream parsing error
      if (error.message.includes('Failed to parse stream') ||
          error.message.includes('GoogleGenerativeAI Error')) {

        if (attempt === maxRetries) {
          throw new Error(`❌ Copy creator failed after ${maxRetries} attempts. Last error: ${error.message}`);
        }

        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }
}

// Invoke the agent with structured output
async function main() {
  try {
    console.log('🚀 Iniciando geração de copies com structured output...\n');

    // Exemplo 1: Usando CopyCreatorInput (formato estruturado)
    const inputStructured: CopyCreatorInput = {
      clientName: "João Silva Construções",
      region: "São Paulo, SP",
      service: "Instalação de pisos laminados",
      offers: "20% de desconto para os 10 primeiros agendamentos",
      phoneNumber: "(11) 99999-9999",
      includeGoogleReviews: true,
      numberOfCopies: 5 // 🆕 Quantidade dinâmica
    };

    const result: CopyResponse = await invokeWithStructuredOutput(inputStructured);

    console.log('\n✅ Resultado Estruturado:');
    console.log(JSON.stringify(result, null, 2));

    // Verificar tipo de resposta
    if (result.type === 'copies') {
      console.log(`\n📊 Total de copies geradas: ${result.copies?.length}`);
      result.copies?.forEach((copy, index) => {
        console.log(`\nCopy ${index + 1}:`);
        console.log(`  - ID: ${copy.id}`);
        console.log(`  - Estratégia: ${copy.strategy || 'N/A'}`);
        console.log(`  - Score: ${copy.score || 'N/A'}/10`);
        console.log(`  - Preview: ${copy.content.substring(0, 100)}...`);
      });
    }

  } catch (error: any) {
    console.error('🚨 Final error:', error.message);
  }
}

export { copyCreatorAgent, internetSearch, invokeWithStructuredOutput, formatInputMessage };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}