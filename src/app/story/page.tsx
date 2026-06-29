"use client";

import { useState } from "react";
import { BookOpenText } from "lucide-react";
import type { Story, StoryQuestion } from "@/types";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ParsingStatus, STORY_GENERATE_STEPS } from "@/components/lesson/ParsingStatus";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { StoryReader } from "@/components/story/StoryReader";
import { StoryQuestionCard } from "@/components/story/StoryQuestionCard";
import { StorySummary } from "@/components/story/StorySummary";
import { isAnswerCorrect } from "@/lib/normalize";

type Phase = "idle" | "loading" | "reading" | "questions" | "summary" | "error";

interface AnsweredQuestion {
  question: StoryQuestion;
  userAnswer: string;
  correct: boolean;
}

export default function StoryPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [story, setStory] = useState<Story | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);

  async function handleGenerate() {
    setPhase("loading");
    setError(undefined);
    const res = await fetch("/api/story/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "שגיאה ביצירת הסיפור");
      setPhase("error");
      return;
    }
    const data = await res.json();
    setStory(data.story);
    setPhase("reading");
  }

  function handleReadingDone() {
    setQuestionIndex(0);
    setCurrentAnswer("");
    setSubmitted(false);
    setCurrentCorrect(null);
    setAnswered([]);
    setPhase("questions");
  }

  function handleSubmitAnswer() {
    if (!story) return;
    const question = story.questions[questionIndex];
    const correct = isAnswerCorrect(currentAnswer, question.correctAnswer);
    setCurrentCorrect(correct);
    setSubmitted(true);
    setAnswered((prev) => [...prev, { question, userAnswer: currentAnswer, correct }]);
  }

  function handleNext() {
    if (!story) return;
    if (questionIndex + 1 < story.questions.length) {
      setQuestionIndex(questionIndex + 1);
      setCurrentAnswer("");
      setSubmitted(false);
      setCurrentCorrect(null);
      return;
    }
    setPhase("summary");
  }

  function handleRestart() {
    setStory(null);
    setAnswered([]);
    setPhase("idle");
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-10">
      <ScreenHeader title="סיפור והבנת הנקרא" />

      {phase === "idle" && (
        <EmptyState
          icon={BookOpenText}
          title="מוכן/ה לסיפור?"
          description="ניצור עבורך סיפור קצר מתוך אוצר המילים האישי שלך, ולאחריו שאלות הבנה"
          action={
            <Button onClick={handleGenerate} icon={BookOpenText}>
              צור סיפור חדש
            </Button>
          }
        />
      )}

      {phase === "loading" && <ParsingStatus steps={STORY_GENERATE_STEPS} />}

      {phase === "error" && (
        <ErrorCard
          message={error ?? ""}
          action={<Button onClick={handleGenerate}>נסה/י שוב</Button>}
        />
      )}

      {phase === "reading" && story && (
        <StoryReader segments={story.segments} onDone={handleReadingDone} />
      )}

      {phase === "questions" && story && (
        <div className="flex flex-col gap-4">
          <QuizProgressBar current={questionIndex} total={story.questions.length} />
          <StoryQuestionCard
            question={story.questions[questionIndex]}
            questionIndex={questionIndex}
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
                {questionIndex + 1 < story.questions.length ? "השאלה הבאה" : "לסיכום"}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "summary" && (
        <StorySummary
          total={answered.length}
          correctCount={answered.filter((a) => a.correct).length}
          missed={answered.filter((a) => !a.correct)}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
