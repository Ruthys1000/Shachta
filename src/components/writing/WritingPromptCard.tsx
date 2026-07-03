import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Badge } from "@/components/ui/Badge";
import { AnswerFeedback } from "@/components/quiz/AnswerFeedback";
import type { WritingPrompt } from "@/types";

export function WritingPromptCard({
  prompt,
  value,
  onChange,
  submitted,
  correct,
}: {
  prompt: WritingPrompt;
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  return (
    <Card className="flex flex-col gap-4 p-4 lg:gap-5 lg:p-6">
      <Badge itemType={prompt.itemType} />
      <p className="text-lg font-semibold lg:text-xl">{prompt.hebrewMeaning}</p>

      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="כתוב/י בתעתיק עברי"
        disabled={submitted}
        autoFocus
      />

      {submitted && correct !== null && (
        <AnswerFeedback correct={correct} correctAnswer={prompt.correctAnswer} />
      )}
    </Card>
  );
}
