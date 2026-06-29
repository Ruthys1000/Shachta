"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

const GREETINGS: readonly string[] = [
  "בוקר טוב איילת! היום הערבית שלך עושה עוד צעד קדימה 🌟",
  "כל מילה שאת לומדת היא ניצחון קטן — ואת אוספת אותם כל הזמן!",
  "מוכנה לכבוש עוד כמה מילים בערבית? את כבר בדרך 💪",
  "הערבית שלך משתפרת מילה-מילה, גם אם לא מרגישים את זה כל יום",
  "כל תרגול קטן מקרב אותך לדיבור שוטף. יאללה, איילת!",
  "איילת, את עושה את זה. מילה אחר מילה, שיעור אחר שיעור 🎯",
  "יום חדש, מילים חדשות, את חדשה ✨",
  "תרגול קטן היום = ערבית שוטפת מחר",
  "כל סריקת שיעור היא עוד חלון לעולם הערבית שלך",
  "את לא לומדת ערבית, את בונה אותה, מילה-מילה",
  "חמש דקות תרגול היום שוות יותר ממה שאת חושבת 💫",
  "איזה כבוד לראות אותך ממשיכה יום אחר יום!",
  "כל מבדק שאת עוברת זה עוד הוכחה שאת מתקדמת",
  "ערבית מדוברת היא מתנה שאת נותנת לעצמך, מילה בכל פעם",
  "קדימה איילת, היום זה היום שמילה אחת תהפוך לטבעית 🌸",
  "את קרובה יותר היום משהיית אתמול. תמיד",
  "כל פתיחה של האפליקציה היא צעד, וגם זה הספיק להיום אם זה כל מה שיש לך",
  "המוח שלך אוסף ערבית גם כשאת לא שמה לב — תמשיכי כך 🧠",
];

function pickRandomGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

export function GreetingBanner() {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setGreeting(pickRandomGreeting()));
  }, []);

  if (!greeting) return null;

  return (
    <Card className="flex w-fit max-w-sm items-center gap-2 bg-primary-soft border-primary/20 px-4 py-2.5">
      <Sparkles className="size-4 shrink-0 text-primary" />
      <span className="text-sm font-medium text-primary">{greeting}</span>
    </Card>
  );
}
