"use client";

import { useState } from "react";
import { Blocks } from "lucide-react";
import type { SentenceLesson, SentenceBuildExercise as SentenceBuildExerciseType } from "@/types";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ParsingStatus, SENTENCE_LESSON_GENERATE_STEPS } from "@/components/lesson/ParsingStatus";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { RuleExplanationCard } from "@/components/sentence-builder/RuleExplanationCard";
import { ExampleBreakdownCard } from "@/components/sentence-builder/ExampleBreakdownCard";
import { SentenceBuildExercise } from "@/components/sentence-builder/SentenceBuildExercise";
import { SentenceBuilderSummary } from "@/components/sentence-builder/SentenceBuilderSummary";
import { apiFetch } from "@/lib/apiFetch";

type Phase = "idle" | "loading" | "learning" | "practice" | "summary" | "error";

interface AnsweredExercise {
  exercise: SentenceBuildExerciseType;
  userOrder: string[];
  correct: boolean;
}

function normalizeOrder(order: string[]): string {
  return order.map((w) => w.trim()).join("|");
}

export default function SentenceBuilderPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [lesson, setLesson] = useState<SentenceLesson | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState<AnsweredExercise[]>([]);

  async function handleGenerate() {
    setPhase("loading");
    setError(undefined);
    const result = await apiFetch<{ lesson: SentenceLesson }>("/api/sentence-builder/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!result.ok) {
      setError(result.error);
      setPhase("error");
      return;
    }
    setLesson(result.data.lesson);
    setPhase("learning");
  }

  function handleStartPractice() {
    setExerciseIndex(0);
    setCurrentOrder([]);
    setSubmitted(false);
    setCurrentCorrect(null);
    setAnswered([]);
    setPhase("practice");
  }

  function handleCheck() {
    if (!lesson) return;
    const exercise = lesson.exercises[exerciseIndex];
    const correct = normalizeOrder(currentOrder) === normalizeOrder(exercise.correctOrder);
    setCurrentCorrect(correct);
    setSubmitted(true);
    setAnswered((prev) => [...prev, { exercise, userOrder: currentOrder, correct }]);
  }

  function handleNext() {
    if (!lesson) return;
    if (exerciseIndex + 1 < lesson.exercises.length) {
      setExerciseIndex(exerciseIndex + 1);
      setCurrentOrder([]);
      setSubmitted(false);
      setCurrentCorrect(null);
      return;
    }
    setPhase("summary");
    fetch("/api/sentence-builder/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: lesson.title }),
    });
  }

  function handleRestart() {
    setLesson(null);
    setAnswered([]);
    setPhase("idle");
  }

  const exercise = lesson?.exercises[exerciseIndex];
  const isComplete = !!exercise && currentOrder.length === exercise.correctOrder.length;

  return (
    <PageShell>
      <ScreenHeader title="לימוד בניית משפטים" />

      {phase === "idle" && (
        <EmptyState
          icon={Blocks}
          title="מוכן/ה ללמוד לבנות משפט?"
          description="ניצור עבורך שיעור קצר על כלל בניית משפט אחד, מתוך אוצר המילים האישי שלך, עם תרגול הרכבה"
          action={
            <Button onClick={handleGenerate} icon={Blocks}>
              התחל/י ללמוד
            </Button>
          }
        />
      )}

      {phase === "loading" && <ParsingStatus steps={SENTENCE_LESSON_GENERATE_STEPS} />}

      {phase === "error" && (
        <ErrorCard
          message={error ?? ""}
          action={<Button onClick={handleGenerate}>נסה/י שוב</Button>}
        />
      )}

      {phase === "learning" && lesson && (
        <div className="flex flex-col gap-4">
          <RuleExplanationCard title={lesson.title} ruleExplanation={lesson.ruleExplanation} />
          {lesson.examples.map((example, idx) => (
            <ExampleBreakdownCard key={idx} example={example} />
          ))}
          <Button onClick={handleStartPractice} className="self-center">
            להתחיל בתרגול
          </Button>
        </div>
      )}

      {phase === "practice" && lesson && exercise && (
        <div className="flex flex-col gap-4">
          <QuizProgressBar current={exerciseIndex} total={lesson.exercises.length} />
          <SentenceBuildExercise
            key={exerciseIndex}
            exercise={exercise}
            onChange={setCurrentOrder}
            submitted={submitted}
            correct={currentCorrect}
          />
          <div className="flex justify-end">
            {!submitted ? (
              <Button onClick={handleCheck} disabled={!isComplete}>
                בדיקה
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {exerciseIndex + 1 < lesson.exercises.length ? "המשפט הבא" : "לסיכום"}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "summary" && (
        <SentenceBuilderSummary
          total={answered.length}
          correctCount={answered.filter((a) => a.correct).length}
          missed={answered.filter((a) => !a.correct)}
          onRestart={handleRestart}
        />
      )}
    </PageShell>
  );
}
