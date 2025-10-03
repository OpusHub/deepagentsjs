import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LanguageModelLike } from "./types.js";

export function getDefaultModel(): LanguageModelLike {
  return new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.3,
    maxRetries: 3,
  }) as any;
}
