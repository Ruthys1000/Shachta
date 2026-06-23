import { CheckCircle2, XCircle } from "lucide-react";

export function AnswerFeedback({
  correct,
  correctAnswer,
}: {
  correct: boolean;
  correctAnswer: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
        correct ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
    >
      {correct ? <CheckCircle2 className="size-5 shrink-0" /> : <XCircle className="size-5 shrink-0" />}
      <span>{correct ? "תשובה נכונה!" : `התשובה הנכונה: ${correctAnswer}`}</span>
    </div>
  );
}
