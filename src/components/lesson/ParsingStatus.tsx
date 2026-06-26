"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export const LESSON_PARSE_STEPS = [
  "מעלים את התמונות...",
  "ה-AI קורא את עמודי השיעור...",
  "מזהה מילים וביטויים...",
  "מסדר את החומר ללמידה...",
];

export const QUIZ_GENERATE_STEPS = [
  "בוחרים את המילים למבדק...",
  "ה-AI מכין שאלות...",
  "מסדר את המבדק...",
];

export function ParsingStatus({ steps }: { steps: string[] }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <Sparkles className="size-10 animate-pulse text-primary" />
      <p className="text-base font-medium">{steps[stepIndex]}</p>
      <p className="text-xs text-muted">זה יכול לקחת כמה שניות, אנחנו עדיין כאן</p>
    </div>
  );
}
