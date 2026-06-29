"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/types";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ParsingStatus, QUIZ_GENERATE_STEPS } from "@/components/lesson/ParsingStatus";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizSummary } from "@/components/quiz/QuizSummary";
import { isAnswerCorrect } from "@/lib/normalize";
import { apiFetch } from "@/lib/apiFetch";

type Phase = "idle" | "loading" | "running" | "summary" | "error";

interface AnsweredQuestion {
  question: QuizQuestion;
  userAnswer: string;
  correct: boolean;
}

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);

  async function handleGenerate() {
    setPhase("loading");
    setError(undefined);
    const result = await apiFetch<{ quiz: Quiz }>("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!result.ok) {
      setError(result.error);
      setPhase("error");
      return;
    }
    setQuiz(result.data.quiz);
    setCurrentIndex(0);
    setCurrentAnswer("");
    setSubmitted(false);
    setCurrentCorrect(null);
    setAnswered([]);
    setPhase("running");
  }

  function checkCorrect(question: QuizQuestion, userAnswer: string): boolean {
    if (question.options && question.options.length > 0) {
      return userAnswer === question.correctAnswer;
    }
    return isAnswerCorrect(userAnswer, question.correctAnswer);
  }

  function handleSubmitAnswer() {
    if (!quiz) return;
    const question = quiz.questions[currentIndex];
    const correct = checkCorrect(question, currentAnswer);
    setCurrentCorrect(correct);
    setSubmitted(true);
    setAnswered((prev) => [...prev, { question, userAnswer: currentAnswer, correct }]);
  }

  const handleNext = useCallback(async () => {
    if (!quiz) return;
    if (currentIndex + 1 < quiz.questions.length) {
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
          vocabularyId: a.question.sourceVocabId,
          correct: a.correct,
        })),
      }),
    });
    setPhase("summary");
  }, [quiz, currentIndex, answered]);

  useEffect(() => {
    if (!submitted || currentCorrect !== true || !quiz) return;
    const isMultipleChoice = !!quiz.questions[currentIndex].options?.length;
    if (!isMultipleChoice) return;
    const timer = setTimeout(handleNext, 800);
    return () => clearTimeout(timer);
  }, [submitted, currentCorrect, currentIndex, quiz, handleNext]);

  function handleRestart() {
    setQuiz(null);
    setAnswered([]);
    setPhase("idle");
  }

  const autoAdvancing =
    submitted && currentCorrect === true && !!quiz?.questions[currentIndex].options?.length;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-10">
      <ScreenHeader title="מבדק תרגול" />

      {phase === "idle" && (
        <EmptyState
          icon={Sparkles}
          title="מוכן/ה לתרגול?"
          description="ניצור עבורך מבדק חדש מתוך אוצר המילים האישי שלך"
          action={
            <Button onClick={handleGenerate} icon={Sparkles}>
              צור מבדק חדש
            </Button>
          }
        />
      )}

      {phase === "loading" && <ParsingStatus steps={QUIZ_GENERATE_STEPS} />}

      {phase === "error" && (
        <ErrorCard
          message={error ?? ""}
          action={<Button onClick={handleGenerate}>נסה/י שוב</Button>}
        />
      )}

      {phase === "running" && quiz && (
        <div className="flex flex-col gap-4">
          <QuizProgressBar current={currentIndex} total={quiz.questions.length} />
          <QuestionCard
            question={quiz.questions[currentIndex]}
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
            ) : !autoAdvancing ? (
              <Button onClick={handleNext}>
                {currentIndex + 1 < quiz.questions.length ? "השאלה הבאה" : "לסיכום"}
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {phase === "summary" && (
        <QuizSummary
          total={answered.length}
          correctCount={answered.filter((a) => a.correct).length}
          missed={answered.filter((a) => !a.correct)}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
