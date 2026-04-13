import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { LLMProviderConfig, LLMProviderType } from "@/types/llm";

const ENV_KEY_MAP: Record<LLMProviderType, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_AI_API_KEY",
  ollama: "",
};

export function getSetting(key: string): string | null {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? null;
}

export function getApiKey(provider: LLMProviderType): string | undefined {
  // 1. Check DB settings first
  const dbKey = getSetting(`${provider}_api_key`);
  if (dbKey) return dbKey;

  // 2. Fallback to environment variables
  const envVar = ENV_KEY_MAP[provider];
  if (envVar) return process.env[envVar];

  return undefined;
}

export function getLLMConfig(
  providerOverride?: string,
  modelOverride?: string
): LLMProviderConfig {
  const provider = (providerOverride || getSetting("llm_provider") || "openai") as LLMProviderType;
  const model = modelOverride || getSetting("llm_model") || "gpt-4o-mini";
  const apiKey = getApiKey(provider);
  const baseUrl =
    provider === "ollama"
      ? getSetting("ollama_base_url") || process.env.OLLAMA_BASE_URL || "http://localhost:11434/api"
      : undefined;

  return { provider, model, apiKey, baseUrl };
}
