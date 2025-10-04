import { ChatOpenAI } from "@langchain/openai";
import { LanguageModelLike } from "./types.js";

export function getDefaultModel(): LanguageModelLike {
  return new ChatOpenAI({
    model: "gpt-5-mini-2025-08-07",
    temperature: 0.5,
    maxRetries: 5,
  }) as any;
}
