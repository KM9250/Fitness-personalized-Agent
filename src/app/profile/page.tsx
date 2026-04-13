"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  User,
  Save,
  Scale,
  Plus,
  Calendar,
  Loader2,
  CheckCircle,
} from "lucide-react";
import type { UserProfile, WeightEntry } from "@/types/user";

const GENDER_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "other", label: "その他" },
];

const ACTIVITY_LEVEL_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "sedentary", label: "座り仕事が多い" },
  { value: "light", label: "軽い運動（週1-2回）" },
  { value: "moderate", label: "適度な運動（週3-5回）" },
  { value: "active", label: "活発な運動（週6-7回）" },
  { value: "very_active", label: "非常に活発（毎日激しい運動）" },
];

const FITNESS_GOAL_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "lose_weight", label: "減量" },
  { value: "maintain", label: "体重維持" },
  { value: "build_muscle", label: "筋肉増量" },
  { value: "improve_endurance", label: "持久力向上" },
  { value: "flexibility", label: "柔軟性向上" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: "",
    heightCm: null,
    weightKg: null,
    birthYear: null,
    gender: null,
    activityLevel: null,
    fitnessGoal: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Weight entry form
  const [weightDate, setWeightDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [weightValue, setWeightValue] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [savingWeight, setSavingWeight] = useState(false);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("プロフィールの取得に失敗しました:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchWeightEntries() {
      try {
        const res = await fetch("/api/weight");
        if (res.ok) {
          const data = await res.json();
          setWeightEntries(data);
        }
      } catch (err) {
        console.error("体重記録の取得に失敗しました:", err);
      }
    }

    fetchProfile();
    fetchWeightEntries();
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("プロフィールの保存に失敗しました:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddWeight() {
    if (!weightValue) return;
    setSavingWeight(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: weightDate,
          weightKg: parseFloat(weightValue),
          bodyFatPercent: bodyFat ? parseFloat(bodyFat) : null,
        }),
      });
      if (res.ok) {
        const newEntry = await res.json();
        setWeightEntries((prev) => [newEntry, ...prev]);
        setWeightValue("");
        setBodyFat("");
      }
    } catch (err) {
      console.error("体重の記録に失敗しました:", err);
    } finally {
      setSavingWeight(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          プロフィール
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          基本情報とフィットネス目標を設定
        </p>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>基本情報</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="表示名"
              value={profile.displayName || ""}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, displayName: e.target.value }))
              }
              placeholder="お名前を入力"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="身長 (cm)"
                type="number"
                min={100}
                max={250}
                value={profile.heightCm ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    heightCm: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="170"
              />
              <Input
                label="体重 (kg)"
                type="number"
                min={30}
                max={300}
                step={0.1}
                value={profile.weightKg ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    weightKg: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                placeholder="70.0"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="生まれ年"
                type="number"
                min={1920}
                max={2010}
                value={profile.birthYear ?? ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    birthYear: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  }))
                }
                placeholder="1990"
              />
              <Select
                label="性別"
                options={GENDER_OPTIONS}
                value={profile.gender || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    gender: (e.target.value || null) as UserProfile["gender"],
                  }))
                }
              />
            </div>

            <Select
              label="活動レベル"
              options={ACTIVITY_LEVEL_OPTIONS}
              value={profile.activityLevel || ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  activityLevel: (e.target.value ||
                    null) as UserProfile["activityLevel"],
                }))
              }
            />

            <Select
              label="フィットネス目標"
              options={FITNESS_GOAL_OPTIONS}
              value={profile.fitnessGoal || ""}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  fitnessGoal: (e.target.value ||
                    null) as UserProfile["fitnessGoal"],
                }))
              }
            />

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saved ? "保存しました" : "保存"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Entry Quick Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-green-600 dark:text-green-400" />
            <CardTitle>体重を記録</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="日付"
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
              />
              <Input
                label="体重 (kg)"
                type="number"
                min={30}
                max={300}
                step={0.1}
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                placeholder="70.0"
              />
              <Input
                label="体脂肪率 (%)"
                type="number"
                min={1}
                max={60}
                step={0.1}
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="20.0"
              />
            </div>
            <Button
              onClick={handleAddWeight}
              disabled={savingWeight || !weightValue}
              variant="secondary"
            >
              {savingWeight ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              記録を追加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Weight Entries */}
      {weightEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最近の体重記録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weightEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {entry.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {entry.weightKg} kg
                    </span>
                    {entry.bodyFatPercent !== null && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        体脂肪 {entry.bodyFatPercent}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
