import { format, formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "yyyy/MM/dd", { locale: ja });
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "yyyy/MM/dd HH:mm", { locale: ja });
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ja });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return `${h}時間${m > 0 ? `${m}分` : ""}`;
  }
  return `${m}分`;
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return "おはようございます";
  if (hour < 17) return "こんにちは";
  return "こんばんは";
}

export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}
