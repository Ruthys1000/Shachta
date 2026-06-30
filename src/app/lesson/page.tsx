"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type {
  ParsedVocabItem,
  BulkVocabConflict,
  BulkVocabItem,
  DuplicateResolution,
  DialogueLine,
  LessonParseResponse,
  Quiz,
  QuizQuestion,
} from "@/types";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ImageUploadForm } from "@/components/lesson/ImageUploadForm";
import { DialogueWalkthrough } from "@/components/lesson/DialogueWalkthrough";
import { VocabFlashcard } from "@/components/lesson/VocabFlashcard";
import { ParsingStatus, LESSON_PARSE_STEPS, QUIZ_GENERATE_STEPS } from "@/components/lesson/ParsingStatus";
import { ConfirmTable } from "@/components/add-words/ConfirmTable";
import { DuplicateDialog } from "@/components/add-words/DuplicateDialog";
import { QuizProgressBar } from "@/components/quiz/QuizProgressBar";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizSummary } from "@/components/quiz/QuizSummary";
import { isAnswerCorrect } from "@/lib/normalize";
import type { CompressedImage } from "@/lib/image";
import { apiFetch } from "@/lib/apiFetch";

type Phase =
  | "upload"
  | "parsing"
  | "dialogue"
  | "confirm-vocab"
  | "study"
  | "quiz-loading"
  | "quiz-running"
  | "quiz-summary"
  | "done";

interface StudyItem {
  vocabularyId: string;
  arabicTranslit: string;
  hebrewMeaning: string;
}

interface AnsweredQuestion {
  question: QuizQuestion;
  userAnswer: string;
  correct: boolean;
}

export default function LessonPage() {
  const [phase, setPhase] = useState<Phase>("upload");

  const [parseError, setParseError] = useState<string | undefined>(undefined);
  const [lessonTitle, setLessonTitle] = useState<string | undefined>(undefined);
  const [dialogue, setDialogue] = useState<DialogueLine[]>([]);

  const [items, setItems] = useState<ParsedVocabItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);

  const [conflicts, setConflicts] = useState<BulkVocabConflict[]>([]);
  const [conflictIndex, setConflictIndex] = useState(0);
  const [resolutions, setResolutions] = useState<Map<string, DuplicateResolution>>(new Map());

  const [savedCount, setSavedCount] = useState(0);
  const [studyItems, setStudyItems] = useState<StudyItem[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyResults, setStudyResults] = useState<{ vocabularyId: string; correct: boolean }[]>([]);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizError, setQuizError] = useState<string | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);

  async function handleUpload(images: CompressedImage[]) {
    setPhase("parsing");
    setParseError(undefined);
    const result = await apiFetch<LessonParseResponse>("/api/lesson/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: images.map((img) => ({ data: img.data, mediaType: img.mediaType })) }),
    });
    if (!result.ok) {
      setParseError(result.error);
      setPhase("upload");
      return;
    }
    const data = result.data;
    setLessonTitle(data.lessonTitle);
    setDialogue(data.dialogue);
    setItems(data.vocabulary);
    if (data.dialogue.length > 0) {
      setPhase("dialogue");
    } else if (data.vocabulary.length > 0) {
      setPhase("confirm-vocab");
    } else {
      startStudy([]);
    }
  }

  function handleDialogueDone() {
    if (items.length > 0) {
      setPhase("confirm-vocab");
    } else {
      startStudy([]);
    }
  }

  function updateItem(next: ParsedVocabItem) {
    setItems((prev) => prev.map((it) => (it.tempId === next.tempId ? next : it)));
  }

  function deleteItem(tempId: string) {
    setItems((prev) => prev.filter((it) => it.tempId !== tempId));
  }

  async function submitBulk(toSubmit: BulkVocabItem[]) {
    return fetch("/api/vocabulary/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: toSubmit }),
    });
  }

  function buildStudyItems(
    sourceItems: { tempId: string; arabicTranslit: string; hebrewMeaning: string }[],
    savedRefs: { tempId: string; id: string }[]
  ): StudyItem[] {
    const byTempId = new Map(sourceItems.map((it) => [it.tempId, it]));
    return savedRefs
      .map((ref) => {
        const source = byTempId.get(ref.tempId);
        if (!source) return null;
        return {
          vocabularyId: ref.id,
          arabicTranslit: source.arabicTranslit,
          hebrewMeaning: source.hebrewMeaning,
        };
      })
      .filter((it): it is StudyItem => it !== null);
  }

  function startStudy(newStudyItems: StudyItem[]) {
    setStudyItems(newStudyItems);
    setStudyIndex(0);
    setStudyResults([]);
    setPhase("study");
  }

  async function handleSaveVocab() {
    if (items.length === 0) return;
    setSaving(true);
    setSaveError(undefined);
    const payload: BulkVocabItem[] = items.map((item) => ({
      tempId: item.tempId,
      arabicTranslit: item.arabicTranslit,
      hebrewMeaning: item.hebrewMeaning,
      itemType: item.itemType,
      resolution: null,
    }));
    const res = await submitBulk(payload);
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSaveError(body.error ?? "שגיאה בשמירה");
      return;
    }
    const data = await res.json();
    if (data.conflicts?.length > 0) {
      setConflicts(data.conflicts);
      setConflictIndex(0);
      setResolutions(new Map());
      setSavedCount(data.saved ?? 0);
      startStudy(buildStudyItems(items, data.savedItems ?? []));
    } else {
      setSavedCount(data.saved ?? 0);
      startStudy(buildStudyItems(items, data.savedItems ?? []));
    }
  }

  async function handleResolve(resolution: DuplicateResolution) {
    const current = conflicts[conflictIndex];
    const nextResolutions = new Map(resolutions);
    nextResolutions.set(current.tempId, resolution);

    if (conflictIndex + 1 < conflicts.length) {
      setResolutions(nextResolutions);
      setConflictIndex(conflictIndex + 1);
      return;
    }

    setSaving(true);
    const payload: BulkVocabItem[] = conflicts.map((c) => ({
      tempId: c.tempId,
      arabicTranslit: c.arabicTranslit,
      hebrewMeaning: c.hebrewMeaning,
      itemType: c.itemType,
      resolution: nextResolutions.get(c.tempId) ?? "skip",
    }));
    const res = await submitBulk(payload);
    setSaving(false);
    const data = await res.json().catch(() => ({ saved: 0, savedItems: [] }));
    setSavedCount((prev) => prev + (data.saved ?? 0));
    setStudyItems((prev) => [...prev, ...buildStudyItems(conflicts, data.savedItems ?? [])]);
    setConflicts([]);
  }

  function handleStudyAnswer(known: boolean) {
    const item = studyItems[studyIndex];
    setStudyResults((prev) => [...prev, { vocabularyId: item.vocabularyId, correct: known }]);
    if (studyIndex + 1 < studyItems.length) {
      setStudyIndex((i) => i + 1);
    }
  }

  async function handleFinishStudy() {
    if (studyResults.length > 0) {
      await fetch("/api/practice/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: studyResults }),
      });
    }
    await handleGenerateQuiz();
  }

  async function handleGenerateQuiz() {
    setPhase("quiz-loading");
    setQuizError(undefined);
    const vocabularyIds = studyItems.map((it) => it.vocabularyId);
    const result = await apiFetch<{ quiz: Quiz }>("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabularyIds }),
    });
    if (!result.ok) {
      setQuizError(result.error);
      setPhase("quiz-loading");
      return;
    }
    setQuiz(result.data.quiz);
    setCurrentIndex(0);
    setCurrentAnswer("");
    setSubmitted(false);
    setCurrentCorrect(null);
    setAnswered([]);
    setPhase("quiz-running");
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

  async function handleNextQuestion() {
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
    setPhase("quiz-summary");
  }

  function handleReset() {
    setPhase("upload");
    setParseError(undefined);
    setLessonTitle(undefined);
    setDialogue([]);
    setItems([]);
    setSaveError(undefined);
    setConflicts([]);
    setSavedCount(0);
    setStudyItems([]);
    setStudyIndex(0);
    setStudyResults([]);
    setQuiz(null);
    setAnswered([]);
  }

  return (
    <PageShell>
      <ScreenHeader title={lessonTitle ?? "שיעור סרוק"} />

      {phase === "upload" && <ImageUploadForm onSubmit={handleUpload} loading={false} error={parseError} />}

      {phase === "parsing" && <ParsingStatus steps={LESSON_PARSE_STEPS} />}

      {phase === "dialogue" && dialogue.length > 0 && (
        <DialogueWalkthrough lines={dialogue} onDone={handleDialogueDone} />
      )}

      {phase === "confirm-vocab" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">בדק/י ואשר/י את המילים שזוהו מהשיעור לפני השמירה לאוצר המילים.</p>
          <ConfirmTable items={items} onChange={updateItem} onDelete={deleteItem} />
          {saveError && <p className="text-sm text-danger">{saveError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleReset}>
              ביטול
            </Button>
            <Button onClick={handleSaveVocab} loading={saving} disabled={items.length === 0}>
              שמירת {items.length} פריטים
            </Button>
          </div>
        </div>
      )}

      {phase === "study" && studyItems.length > 0 && (
        <div className="flex flex-col gap-4">
          <QuizProgressBar current={studyIndex} total={studyItems.length} />
          <VocabFlashcard
            item={{
              tempId: studyItems[studyIndex].vocabularyId,
              arabicTranslit: studyItems[studyIndex].arabicTranslit,
              hebrewMeaning: studyItems[studyIndex].hebrewMeaning,
              itemType: "WORD",
              needsReview: false,
            }}
            onAnswer={handleStudyAnswer}
          />
          {studyIndex + 1 >= studyItems.length && (
            <Button onClick={handleFinishStudy} className="self-end">
              למבדק
            </Button>
          )}
        </div>
      )}

      {phase === "study" && studyItems.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="אין מילים ללמוד בשיעור הזה"
          description="לא נמצאו מילים חדשות ללימוד מהשיעור הזה"
          action={
            <Link href="/">
              <Button>לדף הבית</Button>
            </Link>
          }
        />
      )}

      {phase === "quiz-loading" && (
        <>
          {!quizError && <ParsingStatus steps={QUIZ_GENERATE_STEPS} />}
          {quizError && (
            <ErrorCard
              className="mt-4"
              message={quizError}
              action={<Button onClick={handleGenerateQuiz}>נסה/י שוב</Button>}
            />
          )}
        </>
      )}

      {phase === "quiz-running" && quiz && (
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
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentIndex + 1 < quiz.questions.length ? "השאלה הבאה" : "לסיכום"}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "quiz-summary" && (
        <QuizSummary
          total={answered.length}
          correctCount={answered.filter((a) => a.correct).length}
          missed={answered.filter((a) => !a.correct)}
          onRestart={() => setPhase("done")}
        />
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success-soft px-6 py-12 text-center">
          <CheckCircle2 className="size-10 text-success" />
          <p className="text-base font-medium">סיימת את השיעור! נשמרו {savedCount} מילים באוצר המילים</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleReset}>
              שיעור נוסף
            </Button>
            <Link href="/vocabulary">
              <Button>למאגר אוצר המילים</Button>
            </Link>
          </div>
        </div>
      )}

      {conflicts.length > 0 && conflictIndex < conflicts.length && (
        <DuplicateDialog
          conflict={conflicts[conflictIndex]}
          index={conflictIndex}
          total={conflicts.length}
          onResolve={handleResolve}
        />
      )}
    </PageShell>
  );
}
