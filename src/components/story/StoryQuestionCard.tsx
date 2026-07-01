import { Card } from "@/components/ui/Card";
import { MultipleChoiceOptions } from "@/components/quiz/MultipleChoiceOptions";
import { AnswerFeedback } from "@/components/quiz/AnswerFeedback";
import { TranslateReveal } from "@/components/story/TranslateReveal";
import type { StoryQuestion } from "@/types";

export function StoryQuestionCard({
  question,
  questionIndex,
  value,
  onChange,
  submitted,
  correct,
}: {
  question: StoryQuestion;
  questionIndex: number;
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-lg font-semibold" dir="ltr">
        {question.question}
      </p>
      <TranslateReveal key={questionIndex} hebrew={question.questionHebrew} align="start" />

      <MultipleChoiceOptions
        options={question.options}
        selected={value || null}
        correctAnswer={question.correctAnswer}
        submitted={submitted}
        onSelect={onChange}
      />

      {submitted && correct !== null && (
        <AnswerFeedback correct={correct} correctAnswer={question.correctAnswer} />
      )}
    </Card>
  );
}
