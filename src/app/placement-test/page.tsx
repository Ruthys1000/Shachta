"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ICON } from "@/lib/activities";
import type { PlacementTest } from "@/types";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Spinner } from "@/components/ui/Spinner";
import { ParsingStatus, PLACEMENT_GENERATE_STEPS } from "@/components/lesson/ParsingStatus";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { MultipleChoiceOptions } from "@/components/quiz/MultipleChoiceOptions";
import { AnswerFeedback } from "@/components/quiz/AnswerFeedback";
import { computePlacementLevel } from "@/lib/placementScore";
import { LEARNER_MAX_LEVEL } from "@/lib/constants";
import { apiFetch } from "@/lib/apiFetch";

type Phase = "idle" | "loading" | "running" | "result" | "error";

interface AnsweredQuestion {
  level: number;
  correct: boolean;
}

const LEVEL_DESCRIPTION: Record<number, string> = {
  1: "מתחילה — נתחיל מהבסיס, מילים וביטויים פשוטים.",
  2: "בסיסית — יש לך בסיס יפה של מילים וביטויים קצרים.",
  3: "בינונית — את מבינה משפטים ודקדוק בסיסי היטב.",
  4: "מתקדמת — את מתמודדת עם משפטים מלאים והבנת הנקרא.",
};

export default function PlacementTestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [resultLevel, setResultLevel] = useState<number | null>(null);

  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ placementLevel: number | null }>("/api/placement")
      .then((res) => {
        if (res.ok) setCurrentLevel(res.data.placementLevel);
      })
      .finally(() => setStatusLoading(false));
  }, []);

  async function handleGenerate() {
    setPhase("loading");
    setError(undefined);
    const result = await apiFetch<{ test: PlacementTest }>("/api/placement/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!result.ok) {
      setError(result.error);
      setPhase("error");
      return;
    }
    setTest(result.data.test);
    setCurrentIndex(0);
    setCurrentAnswer("");
    setSubmitted(false);
    setAnswered([]);
    setResultLevel(null);
    setPhase("running");
  }

  function handleSubmitAnswer() {
    if (!test) return;
    const question = test.questions[currentIndex];
    const correct = currentAnswer === question.correctAnswer;
    setSubmitted(true);
    setAnswered((prev) => [...prev, { level: question.level, correct }]);
  }

  async function handleNext() {
    if (!test) return;
    if (currentIndex + 1 < test.questions.length) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
      setSubmitted(false);
      return;
    }

    const level = computePlacementLevel(answered);
    const score = answered.filter((a) => a.correct).length;
    setResultLevel(level);
    setCurrentLevel(level);
    setPhase("result");

    await apiFetch("/api/placement/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placementLevel: level, score, total: answered.length }),
    });
  }

  return (
    <PageShell wide>
      <ScreenHeader
        title="מבחן רמה"
        icon={ICON.placementTest}
        badge={
          currentLevel != null && (
            <span className="inline-flex w-fit items-center rounded-full bg-muted-soft px-2 py-0.5 text-[11px] font-medium text-muted">
              רמה {currentLevel}/{LEARNER_MAX_LEVEL}
            </span>
          )
        }
      />

      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          {statusLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="size-6 text-muted" />
            </div>
          ) : (
            <EmptyState
              icon={ICON.placementTest}
              title={currentLevel != null ? "לעשות שוב מבחן רמה?" : "בואי נבדוק את הרמה שלך"}
              description={
                currentLevel != null
                  ? `הרמה הנוכחית שלך היא ${currentLevel} מתוך ${LEARNER_MAX_LEVEL}. מבחן חדש יעדכן אותה, וכל התרגילים יתאימו לתוצאה.`
                  : "מבחן קצר עם שאלות שנעשות קשות יותר, כדי לאבחן את הרמה שלך. אחרי המבחן כל התרגילים באפליקציה יתאימו לרמה שנקבעה."
              }
              action={
                <Button onClick={handleGenerate} icon={Sparkles}>
                  {currentLevel != null ? "התחילי מבחן חדש" : "התחילי מבחן רמה"}
                </Button>
              }
            />
          )}
        </div>
      )}

      {phase === "loading" && <ParsingStatus steps={PLACEMENT_GENERATE_STEPS} />}

      {phase === "error" && (
        <ErrorCard
          message={error ?? ""}
          action={<Button onClick={handleGenerate}>נסי שוב</Button>}
        />
      )}

      {phase === "running" && test && (
        <div className="flex flex-col gap-4">
          <QuizProgressBar current={currentIndex} total={test.questions.length} />
          <Card className="flex flex-col gap-4 p-4 lg:gap-5 lg:p-6">
            <p className="text-lg font-semibold lg:text-xl">{test.questions[currentIndex].question}</p>
            <MultipleChoiceOptions
              options={test.questions[currentIndex].options}
              selected={currentAnswer || null}
              correctAnswer={test.questions[currentIndex].correctAnswer}
              submitted={submitted}
              onSelect={setCurrentAnswer}
            />
            {submitted && (
              <AnswerFeedback
                correct={currentAnswer === test.questions[currentIndex].correctAnswer}
                correctAnswer={test.questions[currentIndex].correctAnswer}
              />
            )}
          </Card>
          <div className="flex justify-end">
            {!submitted ? (
              <Button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()}>
                בדיקה
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIndex + 1 < test.questions.length ? "השאלה הבאה" : "לתוצאה"}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "result" && resultLevel != null && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <ICON.placementTest className="size-10 text-primary" />
            <p className="text-sm text-muted">הרמה שלך</p>
            <p className="text-4xl font-bold text-primary">
              {resultLevel}
              <span className="text-xl font-medium text-muted">/{LEARNER_MAX_LEVEL}</span>
            </p>
            <p className="text-sm text-foreground">{LEVEL_DESCRIPTION[resultLevel]}</p>
            <p className="text-xs text-muted">
              מעכשיו המבדקים, הסיפורים, בניית המשפטים והדקדוק יתאימו לרמה הזו.
            </p>
          </Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={handleGenerate} variant="secondary">
              לעשות את המבחן שוב
            </Button>
            <Button onClick={() => router.push("/")}>התחילי לתרגל</Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
