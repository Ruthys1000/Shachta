import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function TextField({ error, className, ...rest }: TextFieldProps) {
  return (
    <div className="w-full">
      <input
        className={clsx(
          "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-right outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft",
          error && "border-danger focus:border-danger focus:ring-danger-soft",
          className
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
