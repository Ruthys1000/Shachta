"use client";

import { clsx } from "clsx";
import type { ItemType } from "@prisma/client";

export const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "WORD", label: "מילה" },
  { value: "PHRASE", label: "ביטוי" },
  { value: "SENTENCE", label: "משפט" },
];

export function ItemTypeSelector({
  value,
  onChange,
}: {
  value: ItemType;
  onChange: (next: ItemType) => void;
}) {
  return (
    <div className="flex gap-2">
      {TYPE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex-1 rounded-xl border px-2 py-2 text-sm transition",
            value === opt.value
              ? "border-primary bg-primary-soft text-primary-dark"
              : "border-border text-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
