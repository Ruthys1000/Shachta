"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

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

export const STORY_GENERATE_STEPS = [
  "בוחרים מילים לסיפור...",
  "ה-AI כותב את הסיפור...",
  "מכינים שאלות הבנה...",
];

export const SENTENCE_LESSON_GENERATE_STEPS = [
  "בוחרים מילים מהאוצר...",
  "ה-AI בונה כלל בניית משפט...",
  "מכינים תרגול הרכבה...",
];

export const GRAMMAR_GENERATE_STEPS = [
  "בוחרים גופים וזמן לתרגול...",
  "ה-AI בונה טבלת נטייה...",
  "מכינים תרגול בחירה מרובה...",
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
      <Spinner className="size-10 text-primary" />
      <p className="text-base font-medium">{steps[stepIndex]}</p>
      <p className="text-xs text-muted">זה יכול לקחת כמה שניות, אנחנו עדיין כאן</p>
    </div>
  );
}
