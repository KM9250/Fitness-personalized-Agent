import { cn } from "@/lib/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "strength" | "cardio" | "yoga" | "stretching" | "hiit";
}

const VARIANT_STYLES: Record<string, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  strength: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cardio: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  yoga: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  stretching: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  hiit: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_STYLES[variant] || VARIANT_STYLES.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
