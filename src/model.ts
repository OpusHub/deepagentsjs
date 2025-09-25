import { ChatOpenAI } from "@langchain/openai";
import { LanguageModelLike } from "./types.js";

export function getDefaultModel(): LanguageModelLike {
  return new ChatOpenAI({
    model: "o1-mini",
    maxTokens: 4096,
    temperature: 0.5,
    maxRetries: 3,
    streaming: true,
    modelKwargs: {
      // Habilita caching para prompts repetidos (75% desconto)
      cache_prompt: true,
      // Controla o reasoning effort (low/medium/high)
      reasoning_effort: "medium",
      // Para deep research tasks
      response_format: { type: "text" }
    },
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          process.stdout.write(token);
        },
        handleLLMError(err: any) {
          console.error("Erro no stream OpenAI:", err);
        },
        handleLLMEnd() {
          console.log("\n--- Stream finalizado ---");
        }
      }
    ]
  }) as any;
}
