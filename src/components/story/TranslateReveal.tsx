"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TranslateReveal({
  hebrew,
  align = "center",
}: {
  hebrew: string;
  align?: "center" | "start";
}) {
  const [shown, setShown] = useState(false);
  const alignClass = align === "center" ? "mx-auto" : "self-start";

  if (shown) {
    return <p className={clsx("text-sm text-muted", alignClass)}>{hebrew}</p>;
  }

  return (
    <Button variant="ghost" icon={Languages} onClick={() => setShown(true)} className={alignClass}>
      תרגום לעברית
    </Button>
  );
}
