/**
 * Model configuration for Deep Agents
 *
 * Default model configuration matching the Python implementation exactly.
 * Returns a ChatAnthropic instance configured with claude-sonnet-4-20250514 and maxTokens: 4096.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LanguageModelLike } from "./types.js";

/**
 * Get the default model for Deep Agents
 *
 * Returns a ChatGoogleGenerativeAI instance configured to use Gemini:
 * - model: "gemini-1.5-pro"
 * - maxOutputTokens: 4096
 *
 * @returns ChatGoogleGenerativeAI instance with default configuration
 */
export function getDefaultModel(): LanguageModelLike {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    maxOutputTokens: 4096,
  });
}
