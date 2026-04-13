import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllama } from "ollama-ai-provider";
import type { LLMProviderConfig } from "@/types/llm";

export function getLanguageModel(config: LLMProviderConfig) {
  switch (config.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey: config.apiKey });
      return openai(config.model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey: config.apiKey });
      return anthropic(config.model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
      return google(config.model);
    }
    case "ollama": {
      const ollama = createOllama({
        baseURL: config.baseUrl || "http://localhost:11434/api",
      });
      return ollama(config.model);
    }
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
