"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ListPlus, BookOpen, BookOpenText, Sparkles, ScanLine, LogOut } from "lucide-react";
import { HomeMenuButton } from "@/components/home/HomeMenuButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/Card";

export default function Home() {
  const router = useRouter();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-10 sm:max-w-3xl">
      <div className="mb-8 flex flex-col items-center gap-3 pt-4 text-center sm:pt-10">
        <Card className="p-3">
          <Image
            src="/shachta-avatar.png"
            alt="שחתה"
            width={128}
            height={128}
            priority
            unoptimized
            className="size-28 rounded-2xl object-cover sm:size-32"
          />
        </Card>
        <h1 className="text-2xl font-bold sm:text-3xl">איילת מתרגלת ערבית</h1>
        <p className="text-sm text-muted">תרגול אישי של ערבית מדוברת בתעתיק עברי</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <HomeMenuButton
          href="/lesson"
          icon={ScanLine}
          title="סריקת שיעור"
          description="צלמ/י עמודי שיעור וקבל/י לימוד ומבדק מותאמים"
          tag="העלאה + תרגול"
          emphasis="solid"
        />
        <HomeMenuButton
          href="/add-words"
          icon={ListPlus}
          title="הוספת מילים"
          description="הדבק/י מילים חדשות ושמור/י אותן באוצר המילים"
          tag="העלאה"
        />
        <HomeMenuButton
          href="/vocabulary"
          icon={BookOpen}
          title="אוצר המילים שלי"
          description="צפייה, חיפוש, סינון ומיון בכל הפריטים שצברת"
          tag="עיון וניהול"
        />
        <HomeMenuButton
          href="/quiz"
          icon={Sparkles}
          title="צור מבדק חדש"
          description="תרגול וחזרה על המילים שכבר שמורות באוצר"
          tag="תרגול"
        />
        <HomeMenuButton
          href="/story"
          icon={BookOpenText}
          title="סיפור והבנת הנקרא"
          description="סיפור קצר מהמילים שלך ושאלות הבנה בתעתיק"
          tag="קריאה והבנה"
        />
      </div>

      <button
        onClick={() => setConfirmingLogout(true)}
        className="mx-auto mt-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted transition hover:bg-muted-soft"
      >
        <LogOut className="size-4" />
        התנתקות
      </button>

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
    </main>
  );
}
