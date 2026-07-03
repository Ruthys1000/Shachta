"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

const NAME = "איילת";

// Rotating one-liners that show under the greeting. Kept warm and short.
const ENCOURAGEMENTS: readonly string[] = [
  "כל מילה שאת לומדת היא ניצחון קטן ✨",
  "מוכנה לכבוש עוד כמה מילים בערבית? 💪",
  "הערבית שלך משתפרת מילה-מילה",
  "כל תרגול קטן מקרב אותך לדיבור שוטף 🎯",
  "מילה אחר מילה, שיעור אחר שיעור",
  "חמש דקות תרגול היום שוות יותר ממה שנדמה 💫",
  "את קרובה יותר היום משהיית אתמול",
  "המוח שלך אוסף ערבית גם כשאת לא שמה לב 🧠",
  "יום חדש, מילים חדשות 🌸",
];

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "לילה טוב";
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  if (hour < 21) return "ערב טוב";
  return "לילה טוב";
}

export function HomeHeader({ level }: { level: number | null }) {
  // Time-based greeting and the random line are client-only to avoid an SSR
  // hydration mismatch; they fill in right after mount.
  const [mounted, setMounted] = useState(false);
  const [encouragement, setEncouragement] = useState("");

  useEffect(() => {
    // Deferred out of the effect body so the time-based greeting and random
    // line resolve client-side without a synchronous setState cascade.
    Promise.resolve().then(() => {
      setMounted(true);
      setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    });
  }, []);

  return (
    <header className="flex items-center gap-4">
      <Image
        src="/shachta-avatar.png"
        alt="שחתה"
        width={72}
        height={72}
        priority
        unoptimized
        className="size-16 shrink-0 rounded-2xl object-cover shadow-sm ring-2 ring-primary-soft sm:size-[72px]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold sm:text-2xl">
            {mounted ? `${timeGreeting()}, ${NAME} 👋` : `היי, ${NAME} 👋`}
          </h1>
          {level != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-semibold text-secondary">
              <Sparkles className="size-3.5" />
              רמה {level}
            </span>
          )}
        </div>
        <p className="mt-0.5 min-h-[1.25rem] text-sm text-muted">
          {encouragement || "תרגול אישי של ערבית מדוברת בתעתיק עברי"}
        </p>
      </div>
    </header>
  );
}
