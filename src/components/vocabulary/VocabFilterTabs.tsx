import { clsx } from "clsx";
import type { ItemType } from "@prisma/client";

const TABS: { value: ItemType | "ALL"; label: string }[] = [
  { value: "ALL", label: "הכל" },
  { value: "WORD", label: "מילים" },
  { value: "PHRASE", label: "ביטויים" },
  { value: "SENTENCE", label: "משפטים" },
];

export function VocabFilterTabs({
  value,
  onChange,
}: {
  value: ItemType | "ALL";
  onChange: (value: ItemType | "ALL") => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
            value === tab.value
              ? "bg-primary text-white"
              : "bg-muted-soft text-foreground hover:bg-primary-soft"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
