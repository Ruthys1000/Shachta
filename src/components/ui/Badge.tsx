import { clsx } from "clsx";
import type { ItemType } from "@prisma/client";

const labels: Record<ItemType, string> = {
  WORD: "מילה",
  PHRASE: "ביטוי",
  SENTENCE: "משפט",
};

const toneClasses: Record<ItemType, string> = {
  WORD: "bg-primary-soft text-primary-dark",
  PHRASE: "bg-accent-soft text-accent",
  SENTENCE: "bg-secondary-soft text-secondary",
};

export function Badge({ itemType }: { itemType: ItemType }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[itemType]
      )}
    >
      {labels[itemType]}
    </span>
  );
}
