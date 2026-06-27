export type VocabSort = "newest" | "oldest" | "alpha";

const OPTIONS: { value: VocabSort; label: string }[] = [
  { value: "newest", label: "החדש ביותר" },
  { value: "oldest", label: "הישן ביותר" },
  { value: "alpha", label: "לפי א-ב" },
];

export function VocabSortSelect({
  value,
  onChange,
}: {
  value: VocabSort;
  onChange: (value: VocabSort) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as VocabSort)}
      className="w-fit shrink-0 rounded-xl border border-border bg-card px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
