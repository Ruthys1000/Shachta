import type { ReactNode } from "react";

export function ErrorCard({
  message,
  action,
  className,
}: {
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-6 py-10 text-center ${className ?? ""}`}
    >
      <p className="text-sm text-danger">{message}</p>
      {action}
    </div>
  );
}
