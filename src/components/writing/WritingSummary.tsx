import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { WritingPrompt } from "@/types";

export function WritingSummary({
  total,
  correctCount,
  missed,
  onRestart,
}: {
  total: number;
  correctCount: number;
  missed: { prompt: WritingPrompt; userAnswer: string }[];
  onRestart: () => void;
}) {
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-2 text-center">
        <Trophy className="size-10 text-secondary" />
        <p className="text-2xl font-bold">
          {correctCount} / {total}
        </p>
        <p className="text-sm text-muted">{percent}% תשובות נכונות</p>
      </Card>

      {missed.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">פריטים שטעית בהם</h2>
          {missed.map(({ prompt, userAnswer }, idx) => (
            <Card key={idx} tone="danger" className="flex flex-col gap-1">
              <p className="text-sm font-medium">{prompt.hebrewMeaning}</p>
              <p className="text-sm text-muted">התשובה שלך: {userAnswer || "(לא הוזנה)"}</p>
              <p className="text-sm text-success">התשובה הנכונה: {prompt.correctAnswer}</p>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={onRestart} className="self-center">
        סשן כתיבה חדש
      </Button>
    </div>
  );
}
