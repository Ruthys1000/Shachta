import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "default" | "success" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  default: "bg-card border-border",
  success: "bg-success-soft border-success/30",
  danger: "bg-danger-soft border-danger/30",
  muted: "bg-muted-soft border-border",
};

export function Card({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-4 shadow-sm",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
