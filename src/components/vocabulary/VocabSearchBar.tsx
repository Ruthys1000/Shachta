import { Search } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";

export function VocabSearchBar({
  value,
  onChange,
  searching,
}: {
  value: string;
  onChange: (value: string) => void;
  searching?: boolean;
}) {
  return (
    <div className="relative">
      {searching ? (
        <Spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      ) : (
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      )}
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="חיפוש..."
        className="!pr-9"
      />
    </div>
  );
}
