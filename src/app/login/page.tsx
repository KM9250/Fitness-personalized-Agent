"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "ログインに失敗しました");
        setLoading(false);
      }
    } catch {
      setError("通信エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-6 py-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Dumbbell className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
              FitCoach AI
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              パスワードを入力してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              autoFocus
              error={error || undefined}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !password}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
