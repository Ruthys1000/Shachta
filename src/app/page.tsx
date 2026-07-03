"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ACTIVITY, emphasisFor } from "@/lib/activities";
import { HomeMenuButton } from "@/components/home/HomeMenuButton";
import { HomeHeader } from "@/components/home/HomeHeader";
import { DailyFocusCard } from "@/components/home/DailyFocusCard";
import { HomeStats } from "@/components/home/HomeStats";
import { AiBudgetBadge } from "@/components/home/AiBudgetBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageShell } from "@/components/ui/PageShell";
import type { GamificationSummary } from "@/lib/gamification";

export default function Home() {
  const router = useRouter();
  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/gamification/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <PageShell wide>
      <div className="flex flex-col gap-6">
        <HomeHeader level={summary?.level ?? null} />

        <DailyFocusCard summary={summary} />

        <HomeStats summary={summary} />

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-muted">הוספת תוכן</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <HomeMenuButton
              href={ACTIVITY.lesson.href}
              icon={ACTIVITY.lesson.icon}
              title={ACTIVITY.lesson.label}
              description="צלמ/י עמודי שיעור וקבל/י לימוד ומבדק מותאמים"
              tag="סריקה + תרגול"
              emphasis={emphasisFor(ACTIVITY.lesson)}
            />
            <HomeMenuButton
              href={ACTIVITY.addWords.href}
              icon={ACTIVITY.addWords.icon}
              title={ACTIVITY.addWords.label}
              description="הדבק/י מילים חדשות ושמור/י אותן באוצר המילים"
              tag="הוספת תוכן"
              emphasis={emphasisFor(ACTIVITY.addWords)}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-muted">תרגול ומעקב</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <HomeMenuButton
              href={ACTIVITY.practice.href}
              icon={ACTIVITY.practice.icon}
              title={ACTIVITY.practice.label}
              description="מבדק, בניית משפטים, סיפור וכתיבה - כל התרגילים במקום אחד"
              tag="מבדק · משפטים · סיפור · כתיבה"
              emphasis={emphasisFor(ACTIVITY.practice)}
            />
            <HomeMenuButton
              href={ACTIVITY.vocabulary.href}
              icon={ACTIVITY.vocabulary.icon}
              title={ACTIVITY.vocabulary.label}
              description="צפייה, חיפוש, סינון ומיון בכל הפריטים שצברת"
              tag="ניהול ועיון"
              emphasis={emphasisFor(ACTIVITY.vocabulary)}
            />
          </div>
        </section>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <AiBudgetBadge />
        <button
          onClick={() => setConfirmingLogout(true)}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted transition hover:bg-muted-soft"
        >
          <LogOut className="size-4" />
          התנתקות
        </button>
      </div>

      {confirmingLogout && (
        <ConfirmDialog
          title="התנתקות"
          message="להתנתק מהחשבון?"
          confirmLabel="התנתקות"
          tone="danger"
          loading={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}

      <footer className="mt-8 border-t border-border pt-6 text-center text-xs text-muted">
        אפליקציית &quot;שחתה&quot; אוספת מילים מהשיעורים שאת מעלה, ובונה סביבן תרגילים — מבדקים, משפטי בנייה וסיפורים, הכול בתעתיק עברי.
      </footer>
    </PageShell>
  );
}
