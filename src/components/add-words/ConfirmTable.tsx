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
    <div className="flex flex-col gap-2">
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
