"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface BudgetStatus {
  spentUsd: number;
  budgetUsd: number;
  remainingUsd: number;
  exceeded: boolean;
}

export function AiBudgetBadge() {
  const [status, setStatus] = useState<BudgetStatus | null>(null);

  useEffect(() => {
    fetch("/api/ai-usage/today")
      .then((res) => (res.ok ? res.json() : null))
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium",
        status.exceeded ? "bg-danger-soft text-danger" : "bg-muted-soft text-muted"
      )}
    >
      נוצל ${status.spentUsd.toFixed(2)} מתוך ${status.budgetUsd.toFixed(0)} היום בבינה מלאכותית
    </span>
  );
}
