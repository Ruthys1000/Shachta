import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  children,
  onClose,
  footer,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-card p-5 shadow-lg transition sm:rounded-2xl lg:max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted transition hover:bg-muted-soft"
              aria-label="סגור"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <div>{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
