"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AnswerFeedback } from "@/components/quiz/AnswerFeedback";
import type { SentenceBuildExercise as SentenceBuildExerciseType } from "@/types";

interface Token {
  tokenId: number;
  word: string;
}

function shuffledTokens(words: string[]): Token[] {
  const tokens = words.map((word, tokenId) => ({ tokenId, word }));
  if (tokens.length <= 1) return tokens;
  let shuffled = tokens;
  do {
    shuffled = [...tokens];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } while (shuffled.every((t, i) => t.tokenId === tokens[i].tokenId));
  return shuffled;
}

export function SentenceBuildExercise({
  exercise,
  onChange,
  submitted,
  correct,
}: {
  exercise: SentenceBuildExerciseType;
  onChange: (chosenWords: string[]) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  const tokens = useMemo(() => shuffledTokens(exercise.correctOrder), [exercise]);
  const [chosenIds, setChosenIds] = useState<number[]>([]);

  const chosen = chosenIds.map((id) => tokens.find((t) => t.tokenId === id)!);
  const pool = tokens.filter((t) => !chosenIds.includes(t.tokenId));

  function pick(tokenId: number) {
    const next = [...chosenIds, tokenId];
    setChosenIds(next);
    onChange(next.map((id) => tokens.find((t) => t.tokenId === id)!.word));
  }

  function unpick(index: number) {
    const next = chosenIds.filter((_, i) => i !== index);
    setChosenIds(next);
    onChange(next.map((id) => tokens.find((t) => t.tokenId === id)!.word));
  }

  function reset() {
    setChosenIds([]);
    onChange([]);
  }

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-base font-medium">בנה/י את המשפט: {exercise.hebrewMeaning}</p>

      <div
        className="flex min-h-14 flex-wrap items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted-soft p-3"
        dir="ltr"
      >
        {chosen.length === 0 && <span className="text-sm text-muted">בחר/י מילים מהרשימה למטה</span>}
        {chosen.map((token, idx) => (
          <button
            key={`${token.tokenId}-${idx}`}
            onClick={() => unpick(idx)}
            disabled={submitted}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-[0.97] disabled:opacity-70"
          >
            {token.word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2" dir="ltr">
        {pool.map((token) => (
          <button
            key={token.tokenId}
            onClick={() => pick(token.tokenId)}
            disabled={submitted}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition hover:bg-muted-soft active:scale-[0.97] disabled:opacity-50"
          >
            {token.word}
          </button>
        ))}
      </div>

      {!submitted && chosen.length > 0 && (
        <Button variant="ghost" icon={RotateCcw} onClick={reset} className="self-start">
          איפוס
        </Button>
      )}

      {submitted && correct !== null && (
        <AnswerFeedback correct={correct} correctAnswer={exercise.correctOrder.join(" ")} />
      )}
    </Card>
  );
}
