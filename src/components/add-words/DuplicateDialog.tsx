import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { BulkVocabConflict, DuplicateResolution } from "@/types";

export function DuplicateDialog({
  conflict,
  index,
  total,
  onResolve,
}: {
  conflict: BulkVocabConflict;
  index: number;
  total: number;
  onResolve: (resolution: DuplicateResolution) => void;
}) {
  return (
    <Modal title={`כפילות (${index + 1} מתוך ${total})`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          הפריט &quot;{conflict.arabicTranslit}&quot; כבר קיים באוצר המילים שלך.
        </p>
        <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
          <p className="text-xs font-medium text-muted">קיים במאגר</p>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{conflict.existing.arabicTranslit}</span>
            <Badge itemType={conflict.existing.itemType} />
          </div>
          <span className="text-sm text-muted">{conflict.existing.hebrewMeaning}</span>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary-soft p-3">
          <p className="text-xs font-medium text-primary-dark">חדש</p>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{conflict.arabicTranslit}</span>
            <Badge itemType={conflict.itemType} />
          </div>
          <span className="text-sm text-muted">{conflict.hebrewMeaning}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Button variant="secondary" onClick={() => onResolve("keep")}>
            השאר את הקיים
          </Button>
          <p className="text-xs text-muted">הגרסה הקיימת תישאר ללא שינוי, והפריט הזה יחשב כחלק מהשיעור/הרשימה הנוכחית</p>
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="primary" onClick={() => onResolve("replace")}>
            החלף בחדש
          </Button>
          <p className="text-xs text-muted">הגרסה הקיימת תימחק והפריט החדש יישמר במקומה</p>
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="ghost" onClick={() => onResolve("skip")}>
            דלג על הפריט הזה
          </Button>
          <p className="text-xs text-muted">הפריט הזה לא יישמר ולא יהיה חלק מהשיעור/הרשימה הנוכחית</p>
        </div>
      </div>
    </Modal>
  );
}
