import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { MultipleChoiceOptions } from "@/components/quiz/MultipleChoiceOptions";
import { AnswerFeedback } from "@/components/quiz/AnswerFeedback";
import type { QuizQuestion } from "@/types";

export function QuestionCard({
  question,
  value,
  onChange,
  submitted,
  correct,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  const hasOptions = !!question.options && question.options.length > 0;

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-lg font-semibold">{question.question}</p>

      {hasOptions ? (
        <MultipleChoiceOptions
          options={question.options!}
          selected={value || null}
          correctAnswer={question.correctAnswer}
          submitted={submitted}
          onSelect={onChange}
        />
      ) : (
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="הקלד/י את התשובה כאן"
          disabled={submitted}
          autoFocus
        />
      )}

      {submitted && correct !== null && (
        <AnswerFeedback correct={correct} correctAnswer={question.correctAnswer} />
      )}
    </Card>
  );
}
