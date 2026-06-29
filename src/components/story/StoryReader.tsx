"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
import type { StorySegment } from "@/types";
import { Button } from "@/components/ui/Button";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { TranslateReveal } from "@/components/story/TranslateReveal";

export function StoryReader({
  segments,
  onDone,
}: {
  segments: StorySegment[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const segment = segments[index];
  const isLast = index + 1 >= segments.length;

  return (
    <div className="flex flex-col gap-4">
      <QuizProgressBar current={index} total={segments.length} />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
        <BookOpenText className="mx-auto size-6 text-muted" />
        <p className="text-lg font-semibold" dir="ltr">
          {segment.arabicTranslit}
        </p>
        <TranslateReveal key={index} hebrew={segment.hebrewMeaning} />
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
          <Button onClick={onDone}>להתחיל בשאלות</Button>
        ) : (
          <Button icon={ArrowLeft} onClick={() => setIndex((i) => i + 1)}>
            הבא
          </Button>
        )}
      </div>
    </div>
  );
}
