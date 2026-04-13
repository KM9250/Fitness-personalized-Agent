export type LLMProviderType = "openai" | "anthropic" | "google" | "ollama";

export interface LLMProviderConfig {
  provider: LLMProviderType;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface AICoach {
  id: string;
  name: string;
  avatarUrl: string | null;
  personalityPrompt: string;
  llmProvider: string | null;
  llmModel: string | null;
  description: string | null;
  isActive: boolean | null;
  isPreset: boolean | null;
  createdAt: string;
}

export const PROVIDER_MODELS: Record<LLMProviderType, { label: string; models: { id: string; name: string }[] }> = {
  openai: {
    label: "OpenAI (GPT)",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    ],
  },
  anthropic: {
    label: "Anthropic (Claude)",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
    ],
  },
  google: {
    label: "Google (Gemini)",
    models: [
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    ],
  },
  ollama: {
    label: "Ollama (Local)",
    models: [
      { id: "gemma2:9b", name: "Gemma 2 9B" },
      { id: "gemma2:2b", name: "Gemma 2 2B" },
      { id: "llama3.1:8b", name: "Llama 3.1 8B" },
    ],
  },
};
