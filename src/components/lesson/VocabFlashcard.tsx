"use client";

import { useState } from "react";
import { Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import type { ParsedVocabItem } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function VocabFlashcard({
  item,
  onAnswer,
}: {
  item: ParsedVocabItem;
  onAnswer: (known: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  function handleAnswer(known: boolean) {
    setRevealed(false);
    onAnswer(known);
  }

  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-10 text-center">
      <p className="text-xl font-semibold" dir="ltr">
        {item.arabicTranslit}
      </p>

      {revealed ? (
        <>
          <p className="text-base text-muted">{item.hebrewMeaning}</p>
          <div className="flex gap-2">
            <Button variant="secondary" icon={ThumbsDown} onClick={() => handleAnswer(false)}>
              לא ידעתי
            </Button>
            <Button icon={ThumbsUp} onClick={() => handleAnswer(true)}>
              ידעתי
            </Button>
          </div>
        </>
      ) : (
        <Button variant="secondary" icon={Eye} onClick={() => setRevealed(true)}>
          הצג פירוש
        </Button>
      )}
    </Card>
  );
}
