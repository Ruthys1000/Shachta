"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import type { ItemType } from "@prisma/client";
import type { ParsedVocabItem } from "@/types";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";

const TYPE_OPTIONS: { value: ItemType; label: string }[] = [
  { value: "WORD", label: "מילה" },
  { value: "PHRASE", label: "ביטוי" },
  { value: "SENTENCE", label: "משפט" },
];

export function ConfirmRow({
  item,
  onChange,
  onDelete,
}: {
  item: ParsedVocabItem;
  onChange: (next: ParsedVocabItem) => void;
  onDelete: () => void;
}) {
  return (
    <Card tone={item.needsReview ? "danger" : "default"} className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <TextField
            value={item.arabicTranslit}
            onChange={(e) => onChange({ ...item, arabicTranslit: e.target.value })}
            placeholder="תעתיק בעברית"
          />
          <TextField
            value={item.hebrewMeaning}
            onChange={(e) => onChange({ ...item, hebrewMeaning: e.target.value })}
            placeholder="פירוש בעברית"
          />
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...item, itemType: opt.value })}
                className={`flex-1 rounded-xl border px-2 py-1.5 text-sm transition ${
                  item.itemType === opt.value
                    ? "border-primary bg-primary-soft text-primary-dark"
                    : "border-border text-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 rounded-full p-2 text-muted transition hover:bg-danger-soft hover:text-danger"
          aria-label="הסרה"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {item.needsReview && (
        <div className="flex items-start gap-1.5 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{item.reviewNote || "שורה זו מעורפלת, מומלץ לבדוק/לתקן"}</span>
        </div>
      )}
    </Card>
  );
}
