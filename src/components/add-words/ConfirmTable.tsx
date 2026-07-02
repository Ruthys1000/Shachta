import type { ParsedVocabItem } from "@/types";
import { ConfirmRow } from "./ConfirmRow";

export function ConfirmTable({
  items,
  onChange,
  onDelete,
}: {
  items: ParsedVocabItem[];
  onChange: (next: ParsedVocabItem) => void;
  onDelete: (tempId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <ConfirmRow
          key={item.tempId}
          item={item}
          onChange={onChange}
          onDelete={() => onDelete(item.tempId)}
        />
      ))}
    </div>
  );
}
