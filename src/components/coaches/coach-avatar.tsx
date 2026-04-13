"use client";

import { cn } from "@/lib/utils/cn";
import { User } from "lucide-react";
import Image from "next/image";

interface CoachAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const ICON_SIZE_MAP = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

const PIXEL_SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 64,
};

export function CoachAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: CoachAvatarProps) {
  const initials = name
    .replace(/\(.*\)/, "")
    .trim()
    .slice(0, 1);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-purple-500",
        SIZE_MAP[size],
        className
      )}
      title={name}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={PIXEL_SIZE_MAP[size]}
          height={PIXEL_SIZE_MAP[size]}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white">
          {initials ? (
            <span
              className={cn(
                "font-bold",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                size === "lg" && "text-xl"
              )}
            >
              {initials}
            </span>
          ) : (
            <User className={ICON_SIZE_MAP[size]} />
          )}
        </div>
      )}
    </div>
  );
}
