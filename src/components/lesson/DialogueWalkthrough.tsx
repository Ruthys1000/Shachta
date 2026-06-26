"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import type { DialogueLine } from "@/types";
import { Button } from "@/components/ui/Button";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";

export function DialogueWalkthrough({
  lines,
  onDone,
}: {
  lines: DialogueLine[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const line = lines[index];
  const isLast = index + 1 >= lines.length;

  return (
    <div className="flex flex-col gap-4">
      <QuizProgressBar current={index} total={lines.length} />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
        <MessageCircle className="mx-auto size-6 text-muted" />
        {line.speaker && <span className="text-xs font-medium text-muted">{line.speaker}</span>}
        <p className="text-lg font-semibold" dir="ltr">
          {line.arabicTranslit}
        </p>
        <p className="text-base text-muted">{line.hebrewMeaning}</p>
      </div>

      <div className="flex justify-between gap-2">
        <Button
          variant="ghost"
          icon={ArrowRight}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          הקודם
        </Button>
        {isLast ? (
          <Button onClick={onDone}>סיימתי, לעבוד על אוצר המילים</Button>
        ) : (
          <Button icon={ArrowLeft} onClick={() => setIndex((i) => i + 1)}>
            הבא
          </Button>
        )}
      </div>
    </div>
  );
}
