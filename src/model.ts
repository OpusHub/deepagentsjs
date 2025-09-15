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
 * - model: "gemini-2.0-flash" (more stable for streaming than 2.5 Pro)
 * - maxOutputTokens: 4096
 * - Enhanced error handling and retry logic
 *
 * @returns ChatGoogleGenerativeAI instance with default configuration
 */
export function getDefaultModel(): LanguageModelLike {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",  // More stable than 2.5 Pro for streaming
    maxOutputTokens: 4096,
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    // Add retry configuration to handle stream parsing errors
    maxRetries: 3,
    // Re-enable streaming since 2.0 Flash is more stable
    streaming: true,
  }) as any;
}
