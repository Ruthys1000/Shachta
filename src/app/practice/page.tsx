import { ACTIVITY, emphasisFor } from "@/lib/activities";
import { HomeMenuButton } from "@/components/home/HomeMenuButton";
import { PageShell } from "@/components/ui/PageShell";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function PracticePage() {
  return (
    <PageShell wide>
      <ScreenHeader title="תרגול" icon={ACTIVITY.practice.icon} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HomeMenuButton
          href={ACTIVITY.quiz.href}
          icon={ACTIVITY.quiz.icon}
          title="מבדק"
          description="תרגול וחזרה על המילים שכבר שמורות באוצר"
          tag="תרגול"
          emphasis={emphasisFor(ACTIVITY.quiz)}
        />
        <HomeMenuButton
          href={ACTIVITY.sentenceBuilder.href}
          icon={ACTIVITY.sentenceBuilder.icon}
          title="בניית משפטים"
          description="למד/י איך מרכיבים משפט נכון מהמילים שלך, צעד-צעד"
          tag="לימוד"
          emphasis={emphasisFor(ACTIVITY.sentenceBuilder)}
        />
        <HomeMenuButton
          href={ACTIVITY.grammar.href}
          icon={ACTIVITY.grammar.icon}
          title="דקדוק: גופים וזמנים"
          description="תרגול נטיית פועל לפי גוף (הוא/היא/אני...) וזמן (עבר/הווה/עתיד)"
          tag="לימוד"
          emphasis={emphasisFor(ACTIVITY.grammar)}
        />
        <HomeMenuButton
          href={ACTIVITY.story.href}
          icon={ACTIVITY.story.icon}
          title="סיפור והבנת הנקרא"
          description="סיפור קצר מהמילים שלך ושאלות הבנה בתעתיק"
          tag="תרגול הבנה"
          emphasis={emphasisFor(ACTIVITY.story)}
        />
        <HomeMenuButton
          href={ACTIVITY.writing.href}
          icon={ACTIVITY.writing.icon}
          title="כתיבה"
          description="מילה, משפט או שאלה בעברית - ואת/ה כותב/ת את התעתיק הערבי"
          tag="תרגול הפקה"
          emphasis={emphasisFor(ACTIVITY.writing)}
        />
      </div>
    </PageShell>
  );
}
