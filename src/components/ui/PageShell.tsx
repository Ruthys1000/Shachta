import { clsx } from "clsx";
import type { ReactNode } from "react";

export function PageShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <main
      className={clsx(
        "mx-auto w-full max-w-2xl flex-1 p-4 pb-10 lg:p-8 lg:pb-16",
        wide ? "lg:max-w-4xl" : "lg:max-w-3xl"
      )}
    >
      {children}
    </main>
  );
}
