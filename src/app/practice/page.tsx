import { Sparkles, Blocks, BookOpenText, PenLine } from "lucide-react";
import { HomeMenuButton } from "@/components/home/HomeMenuButton";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function PracticePage() {
  return (
    <PageShell wide>
      <ScreenHeader title="תרגול" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HomeMenuButton
          href="/quiz"
          icon={Sparkles}
          title="מבדק"
          description="תרגול וחזרה על המילים שכבר שמורות באוצר"
          tag="תרגול"
          emphasis="solid"
        />
        <HomeMenuButton
          href="/sentence-builder"
          icon={Blocks}
          title="בניית משפטים"
          description="למד/י איך מרכיבים משפט נכון מהמילים שלך, צעד-צעד"
          tag="לימוד"
        />
        <HomeMenuButton
          href="/story"
          icon={BookOpenText}
          title="סיפור והבנת הנקרא"
          description="סיפור קצר מהמילים שלך ושאלות הבנה בתעתיק"
          tag="תרגול הבנה"
        />
        <HomeMenuButton
          href="/writing"
          icon={PenLine}
          title="כתיבה"
          description="מילה, משפט או שאלה בעברית - ואת/ה כותב/ת את התעתיק הערבי"
          tag="תרגול הפקה"
        />
      </div>
    </PageShell>
  );
}
