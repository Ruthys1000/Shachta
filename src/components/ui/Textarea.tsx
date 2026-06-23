import { clsx } from "clsx";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-right outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft",
        className
      )}
      {...rest}
    />
  );
}
