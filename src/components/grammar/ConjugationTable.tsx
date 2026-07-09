import { Card } from "@/components/ui/Card";
import type { GrammarConjugationExample } from "@/types";

export function ConjugationTable({ rows }: { rows: GrammarConjugationExample[] }) {
  return (
    <Card className="flex flex-col gap-2">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0"
        >
          <span className="w-16 shrink-0 text-sm font-semibold text-muted">{row.pronoun}</span>
          <div className="flex flex-1 flex-col items-end gap-0.5 text-right">
            <span className="text-base font-medium" dir="ltr">
              {row.arabicTranslit}
            </span>
            <span className="text-xs text-muted">{row.hebrewMeaning}</span>
          </div>
        </div>
      ))}
    </Card>
  );
}
