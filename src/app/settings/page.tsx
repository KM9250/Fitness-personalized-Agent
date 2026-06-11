"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Save,
  Cpu,
  Globe,
  MessageSquare,
  Clock,
  Download,
  Loader2,
  CheckCircle,
} from "lucide-react";

import { PROVIDER_MODELS } from "@/types/llm";
import type { LLMProviderType } from "@/types/llm";

export default function SettingsPage() {
  // LLM settings
  const [provider, setProvider] = useState<LLMProviderType>("openai");
  const [model, setModel] = useState<string>("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState("http://localhost:11434");

  // Spontaneous messages
  const [spontaneousEnabled, setSpontaneousEnabled] = useState(false);
  const [spontaneousInterval, setSpontaneousInterval] = useState("60");

  // Language
  const [language, setLanguage] = useState("ja");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  // All raw settings (used to switch API keys per provider)
  const [allSettings, setAllSettings] = useState<Record<string, string>>({});

  // Load settings on mount
  // Backend canonical keys: llm_provider, llm_model, {provider}_api_key,
  // ollama_base_url, spontaneous_enabled, spontaneous_interval_min, language
  // *_api_key values arrive masked (••••xxxx); the input stays empty and the
  // key is only sent when the user types a new one.
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data: Record<string, string> = await res.json();
          setAllSettings(data);
          const loadedProvider = (data.llm_provider ||
            "openai") as LLMProviderType;
          setProvider(loadedProvider);
          if (data.llm_model) setModel(data.llm_model);
          if (data.ollama_base_url) setOllamaBaseUrl(data.ollama_base_url);
          if (data.spontaneous_enabled !== undefined)
            setSpontaneousEnabled(data.spontaneous_enabled === "true");
          if (data.spontaneous_interval_min)
            setSpontaneousInterval(data.spontaneous_interval_min);
          if (data.language) setLanguage(data.language);
        }
      } catch (err) {
        console.error("設定の取得に失敗しました:", err);
      }
    }
    fetchSettings();
  }, []);

  const storedKeyMask = allSettings[`${provider}_api_key`] || "";

  // Update model when provider changes; clear the key input so a key for
  // one provider is never saved under another
  function handleProviderChange(newProvider: LLMProviderType) {
    setProvider(newProvider);
    const models = PROVIDER_MODELS[newProvider].models;
    if (models.length > 0) {
      setModel(models[0].id);
    }
    setApiKey("");
  }

  const providerOptions = Object.entries(PROVIDER_MODELS).map(
    ([key, value]) => ({
      value: key,
      label: value.label,
    })
  );

  const modelOptions = PROVIDER_MODELS[provider].models.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const languageOptions = [
    { value: "ja", label: "日本語" },
    { value: "en", label: "English" },
  ];

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, string> = {
        llm_provider: provider,
        llm_model: model,
        ollama_base_url: ollamaBaseUrl,
        spontaneous_enabled: String(spontaneousEnabled),
        spontaneous_interval_min: spontaneousInterval,
        language,
      };
      if (provider !== "ollama" && apiKey) {
        payload[`${provider}_api_key`] = apiKey;
      }
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated: Record<string, string> = await res.json();
        setAllSettings(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("設定の保存に失敗しました:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleExportObsidian() {
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "fitness-export.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("エクスポートに失敗しました:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          設定
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          アプリケーションの設定を管理
        </p>
      </div>

      {/* LLM Provider Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>LLMプロバイダー設定</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              label="プロバイダー"
              options={providerOptions}
              value={provider}
              onChange={(e) =>
                handleProviderChange(e.target.value as LLMProviderType)
              }
            />

            <Select
              label="モデル"
              options={modelOptions}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />

            <Input
              label="APIキー"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                provider === "ollama"
                  ? "Ollamaでは不要です"
                  : storedKeyMask
                  ? `設定済み (${storedKeyMask}) — 変更する場合のみ入力`
                  : "sk-... または対応するAPIキー"
              }
              disabled={provider === "ollama"}
            />

            {provider === "ollama" && (
              <Input
                label="Ollama ベースURL"
                value={ollamaBaseUrl}
                onChange={(e) => setOllamaBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spontaneous Messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>自発的メッセージ</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  自発的メッセージを有効にする
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AIコーチが定期的にメッセージを送信します
                </p>
              </div>
              <button
                onClick={() => setSpontaneousEnabled(!spontaneousEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  spontaneousEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                    spontaneousEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Interval */}
            {spontaneousEnabled && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                <Input
                  label="送信間隔（分）"
                  type="number"
                  min={5}
                  max={1440}
                  value={spontaneousInterval}
                  onChange={(e) => setSpontaneousInterval(e.target.value)}
                  placeholder="60"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            <CardTitle>言語設定</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            label="表示言語"
            options={languageOptions}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <CardTitle>データエクスポート</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              トレーニングデータをObsidian形式でエクスポートします
            </p>
            <Button
              variant="outline"
              onClick={handleExportObsidian}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Obsidianエクスポート
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-20 z-10 md:bottom-4">
        <Button
          size="lg"
          className="w-full shadow-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="mr-2 h-4 w-4" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saved ? "設定を保存しました" : "設定を保存"}
        </Button>
      </div>

      {/* Logout (effective only when APP_PASSWORD auth is enabled) */}
      <div className="pb-4 text-center">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="text-sm text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline dark:text-gray-500 dark:hover:text-gray-300"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
