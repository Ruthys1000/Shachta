import { Card } from "@/components/ui/Card";
import { MultipleChoiceOptions } from "@/components/quiz/MultipleChoiceOptions";
import { AnswerFeedback } from "@/components/quiz/AnswerFeedback";
import type { GrammarExercise } from "@/types";

export function GrammarExerciseCard({
  exercise,
  value,
  onChange,
  submitted,
  correct,
}: {
  exercise: GrammarExercise;
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-lg font-semibold">{exercise.promptHebrew}</p>

      <MultipleChoiceOptions
        options={exercise.options}
        selected={value || null}
        correctAnswer={exercise.correctAnswer}
        submitted={submitted}
        onSelect={onChange}
      />

      {submitted && correct !== null && (
        <AnswerFeedback correct={correct} correctAnswer={exercise.correctAnswer} />
      )}
    </Card>
  );
}
