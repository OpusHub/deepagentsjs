import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LanguageModelLike } from "./types.js";

export function getDefaultModel(): LanguageModelLike {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    maxOutputTokens: 4096,
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
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
