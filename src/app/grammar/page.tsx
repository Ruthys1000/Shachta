"use client";

import { useState } from "react";
import { ICON } from "@/lib/activities";
import type { GrammarLesson, GrammarExercise } from "@/types";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ParsingStatus, GRAMMAR_GENERATE_STEPS } from "@/components/lesson/ParsingStatus";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { RuleExplanationCard } from "@/components/sentence-builder/RuleExplanationCard";
import { ConjugationTable } from "@/components/grammar/ConjugationTable";
import { GrammarExerciseCard } from "@/components/grammar/GrammarExerciseCard";
import { GrammarSummary } from "@/components/grammar/GrammarSummary";
import { apiFetch } from "@/lib/apiFetch";

type Phase = "idle" | "loading" | "learning" | "practice" | "summary" | "error";

interface AnsweredExercise {
  exercise: GrammarExercise;
  userAnswer: string;
  correct: boolean;
}

export default function GrammarPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState<AnsweredExercise[]>([]);

  async function handleGenerate() {
    setPhase("loading");
    setError(undefined);
    const result = await apiFetch<{ lesson: GrammarLesson }>("/api/grammar/generate", {
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
    setCurrentAnswer("");
    setSubmitted(false);
    setCurrentCorrect(null);
    setAnswered([]);
    setPhase("practice");
  }

  function handleSubmitAnswer() {
    if (!lesson) return;
    const exercise = lesson.exercises[exerciseIndex];
    const correct = currentAnswer === exercise.correctAnswer;
    setCurrentCorrect(correct);
    setSubmitted(true);
    setAnswered((prev) => [...prev, { exercise, userAnswer: currentAnswer, correct }]);
  }

  function handleNext() {
    if (!lesson) return;
    if (exerciseIndex + 1 < lesson.exercises.length) {
      setExerciseIndex(exerciseIndex + 1);
      setCurrentAnswer("");
      setSubmitted(false);
      setCurrentCorrect(null);
      return;
    }
    setPhase("summary");
    const finalAnswered = [...answered];
    fetch("/api/grammar/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: lesson.title,
        focus: lesson.focus,
        correctCount: finalAnswered.filter((a) => a.correct).length,
        wrongCount: finalAnswered.filter((a) => !a.correct).length,
      }),
    });
  }

  function handleRestart() {
    setLesson(null);
    setAnswered([]);
    setPhase("idle");
  }

  const exercise = lesson?.exercises[exerciseIndex];

  return (
    <PageShell wide>
      <ScreenHeader title="דקדוק: גופים וזמנים" icon={ICON.grammar} />

      {phase === "idle" && (
        <EmptyState
          icon={ICON.grammar}
          title="מוכן/ה לתרגל נטיית פועל?"
          description="ניצור עבורך שיעור קצר על נטיית פועל בגוף וזמן מסוימים, עם תרגול בחירה מרובה"
          action={
            <Button onClick={handleGenerate} icon={ICON.ai}>
              התחל/י ללמוד
            </Button>
          }
        />
      )}

      {phase === "loading" && <ParsingStatus steps={GRAMMAR_GENERATE_STEPS} />}

      {phase === "error" && (
        <ErrorCard
          message={error ?? ""}
          action={<Button onClick={handleGenerate}>נסה/י שוב</Button>}
        />
      )}

      {phase === "learning" && lesson && (
        <div className="flex flex-col gap-4">
          <RuleExplanationCard title={lesson.title} ruleExplanation={lesson.ruleExplanation} />
          <ConjugationTable rows={lesson.conjugationExamples} />
          <Button onClick={handleStartPractice} className="self-center">
            להתחיל בתרגול
          </Button>
        </div>
      )}

      {phase === "practice" && lesson && exercise && (
        <div className="flex flex-col gap-4">
          <QuizProgressBar current={exerciseIndex} total={lesson.exercises.length} />
          <GrammarExerciseCard
            exercise={exercise}
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
                {exerciseIndex + 1 < lesson.exercises.length ? "התרגיל הבא" : "לסיכום"}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "summary" && (
        <GrammarSummary
          total={answered.length}
          correctCount={answered.filter((a) => a.correct).length}
          missed={answered.filter((a) => !a.correct)}
          onRestart={handleRestart}
        />
      )}
    </PageShell>
  );
}
