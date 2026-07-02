"use client";

import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ParseInputForm({
  value,
  onChange,
  onSubmit,
  loading,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        הדבק/י שורות של מילים, ביטויים או משפטים בתעתיק עברי. אפשר שורה עם פירוש (מופרד ב-
        &quot;-&quot; או &quot;=&quot;) או בלי פירוש כלל.
      </p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"שוכרן - תודה\nכיף חאלכ = מה שלומך\nאהלן"}
        rows={10}
        className="min-h-48 lg:min-h-64"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button
        icon={Sparkles}
        onClick={onSubmit}
        loading={loading}
        disabled={!value.trim()}
        className="self-end"
      >
        ניתוח עם AI
      </Button>
    </div>
  );
}
