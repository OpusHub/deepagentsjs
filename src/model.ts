import { ChatOpenAI } from "@langchain/openai";
import { LanguageModelLike } from "./types.js";

export function getDefaultModel(): LanguageModelLike {
  return new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.5,
    maxRetries: 3,
  }) as any;
}
