import { Search } from "lucide-react";
import { TextField } from "@/components/ui/TextField";

export function VocabSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="חיפוש..."
        className="!pr-9"
      />
    </div>
  );
}
