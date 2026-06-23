import { Pencil, Trash2 } from "lucide-react";
import type { VocabularyWithHistory } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function VocabRow({
  item,
  onEdit,
  onDelete,
}: {
  item: VocabularyWithHistory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{item.arabicTranslit}</span>
          <Badge itemType={item.itemType} />
        </div>
        <span className="truncate text-sm text-muted">{item.hebrewMeaning}</span>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={onEdit}
          className="rounded-full p-2 text-muted transition hover:bg-primary-soft hover:text-primary"
          aria-label="עריכה"
        >
          <Pencil className="size-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-full p-2 text-muted transition hover:bg-danger-soft hover:text-danger"
          aria-label="מחיקה"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </Card>
  );
}
