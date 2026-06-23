import { clsx } from "clsx";

export function MultipleChoiceOptions({
  options,
  selected,
  correctAnswer,
  submitted,
  onSelect,
}: {
  options: string[];
  selected: string | null;
  correctAnswer: string;
  submitted: boolean;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const isSelected = option === selected;
        const isCorrect = option === correctAnswer;
        return (
          <button
            key={option}
            onClick={() => !submitted && onSelect(option)}
            disabled={submitted}
            className={clsx(
              "rounded-xl border px-4 py-3 text-right text-sm transition",
              !submitted && isSelected && "border-primary bg-primary-soft text-primary-dark",
              !submitted && !isSelected && "border-border hover:bg-muted-soft",
              submitted && isCorrect && "border-success bg-success-soft text-success",
              submitted && isSelected && !isCorrect && "border-danger bg-danger-soft text-danger",
              submitted && !isSelected && !isCorrect && "border-border opacity-60"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
