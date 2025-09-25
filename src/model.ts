import { ChatOpenAI } from "@langchain/openai";
import { LanguageModelLike } from "./types.js";

export function getDefaultModel(): LanguageModelLike {
  return new ChatOpenAI({
    model: "gpt-5.1",
    maxTokens: 4096,
    temperature: 0.5,
    maxRetries: 3,
    streaming: true,
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
