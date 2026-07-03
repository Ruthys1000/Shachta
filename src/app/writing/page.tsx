"use client";

import { useState } from "react";
import { ICON } from "@/lib/activities";
import type { WritingPrompt } from "@/types";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Spinner } from "@/components/ui/Spinner";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { WritingPromptCard } from "@/components/writing/WritingPromptCard";
import { WritingSummary } from "@/components/writing/WritingSummary";
import { isAnswerCorrect } from "@/lib/normalize";
import { apiFetch } from "@/lib/apiFetch";

type Phase = "idle" | "loading" | "running" | "summary" | "error";

interface AnsweredPrompt {
  prompt: WritingPrompt;
  userAnswer: string;
  correct: boolean;
}

export default function WritingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<WritingPrompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState<AnsweredPrompt[]>([]);

  async function handleStart() {
    setPhase("loading");
    setError(undefined);
    const result = await apiFetch<{ items: WritingPrompt[] }>("/api/writing/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!result.ok) {
      setError(result.error);
      setPhase("error");
      return;
    }
    setItems(result.data.items);
    setCurrentIndex(0);
    setCurrentAnswer("");
    setSubmitted(false);
    setCurrentCorrect(null);
    setAnswered([]);
    setPhase("running");
  }

  function handleSubmitAnswer() {
    const prompt = items[currentIndex];
    const correct = isAnswerCorrect(currentAnswer, prompt.correctAnswer);
    setCurrentCorrect(correct);
    setSubmitted(true);
    setAnswered((prev) => [...prev, { prompt, userAnswer: currentAnswer, correct }]);
  }

  async function handleNext() {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
      setSubmitted(false);
      setCurrentCorrect(null);
      return;
    }

    await fetch("/api/practice/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        results: answered.map((a) => ({
          vocabularyId: a.prompt.vocabularyId,
          correct: a.correct,
        })),
      }),
    });
    setPhase("summary");
  }

  function handleRestart() {
    setItems([]);
    setAnswered([]);
    setPhase("idle");
  }

  return (
    <PageShell wide>
      <ScreenHeader title="תרגול כתיבה" icon={ICON.writing} />

      {phase === "idle" && (
        <EmptyState
          icon={ICON.writing}
          title="מוכן/ה לכתוב?"
          description="נציג לך מילה, משפט או שאלה בעברית, ואת/ה תקליד/י את התעתיק הערבי"
          action={
            <Button onClick={handleStart} icon={ICON.writing}>
              התחל/י כתיבה
            </Button>
          }
        />
      )}

      {phase === "loading" && (
        <div className="flex justify-center py-12">
          <Spinner className="size-8 text-primary" />
        </div>
      )}

      {phase === "error" && (
        <ErrorCard message={error ?? ""} action={<Button onClick={handleStart}>נסה/י שוב</Button>} />
      )}

      {phase === "running" && items.length > 0 && (
        <div className="flex flex-col gap-4">
          <QuizProgressBar current={currentIndex} total={items.length} />
          <WritingPromptCard
            prompt={items[currentIndex]}
            value={currentAnswer}
            onChange={setCurrentAnswer}
            submitted={submitted}
            correct={currentCorrect}
          />
          <div className="flex justify-end">
            {!submitted ? (
              <Button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()}>
                בדיקה
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIndex + 1 < items.length ? "הבא" : "לסיכום"}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "summary" && (
        <WritingSummary
          total={answered.length}
          correctCount={answered.filter((a) => a.correct).length}
          missed={answered.filter((a) => !a.correct)}
          onRestart={handleRestart}
        />
      )}
    </PageShell>
  );
}
