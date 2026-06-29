import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SentenceBuildExercise } from "@/types";

export function SentenceBuilderSummary({
  total,
  correctCount,
  missed,
  onRestart,
}: {
  total: number;
  correctCount: number;
  missed: { exercise: SentenceBuildExercise; userOrder: string[] }[];
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
        <p className="text-sm text-muted">{percent}% משפטים תקינים</p>
      </Card>

      {missed.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">משפטים שכדאי לחזור עליהם</h2>
          {missed.map(({ exercise, userOrder }, idx) => (
            <Card key={idx} tone="danger" className="flex flex-col gap-1">
              <p className="text-sm text-muted">{exercise.hebrewMeaning}</p>
              <p className="text-sm">
                ההרכבה שלך: {userOrder.length > 0 ? userOrder.join(" ") : "(לא הושלם)"}
              </p>
              <p className="text-sm text-success" dir="ltr">
                הסדר הנכון: {exercise.correctOrder.join(" ")}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={onRestart} className="self-center">
        שיעור חדש
      </Button>
    </div>
  );
}
