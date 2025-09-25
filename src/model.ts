import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LanguageModelLike } from "./types.js";

export function getDefaultModel(): LanguageModelLike {
  return new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.3,
    maxRetries: 3,
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          process.stdout.write(token);
        },
        handleLLMError(err: any) {
          console.error("Erro no stream Gemini:", err);
        },
        handleLLMEnd() {
          console.log("\n--- Stream finalizado ---");
        }
      }
    ]
  }) as any;
}
