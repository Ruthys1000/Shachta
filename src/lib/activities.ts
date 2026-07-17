import type { LucideIcon } from "lucide-react";
import {
  ScanLine,
  Dumbbell,
  ListChecks,
  Blocks,
  ScrollText,
  PenLine,
  ListPlus,
  BookOpen,
  Award,
  TrendingUp,
  Target,
  Sparkles,
  SpellCheck2,
  Gauge,
} from "lucide-react";

/**
 * Single source of truth for the app's iconography. Each concept maps to
 * exactly one glyph, used identically everywhere (sidebar, home, screens).
 *
 * `Sparkles` (`ai`) is reserved for AI generate/analyze actions only — never
 * for an activity, level, or the daily goal.
 */
export const ICON = {
  lesson: ScanLine,
  practice: Dumbbell,
  quiz: ListChecks,
  sentenceBuilder: Blocks,
  grammar: SpellCheck2,
  story: ScrollText,
  writing: PenLine,
  addWords: ListPlus,
  vocabulary: BookOpen,
  achievements: Award,
  placementTest: Gauge,
  level: TrendingUp,
  dailyGoal: Target,
  ai: Sparkles,
} as const;

export type ActivityGroup = "input" | "practice" | "track";

export interface Activity {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Core activities are emphasized (solid card / filled icon). */
  core: boolean;
  group: ActivityGroup;
}

export const ACTIVITIES: Activity[] = [
  { key: "lesson", href: "/lesson", label: "סריקת שיעור", icon: ICON.lesson, core: true, group: "input" },
  { key: "addWords", href: "/add-words", label: "הוספת מילים", icon: ICON.addWords, core: false, group: "input" },
  { key: "placementTest", href: "/placement-test", label: "מבחן רמה", icon: ICON.placementTest, core: false, group: "practice" },
  { key: "quiz", href: "/quiz", label: "מבדק", icon: ICON.quiz, core: true, group: "practice" },
  { key: "sentenceBuilder", href: "/sentence-builder", label: "בניית משפטים", icon: ICON.sentenceBuilder, core: false, group: "practice" },
  { key: "grammar", href: "/grammar", label: "דקדוק: גופים וזמנים", icon: ICON.grammar, core: false, group: "practice" },
  { key: "story", href: "/story", label: "סיפור והבנת הנקרא", icon: ICON.story, core: false, group: "practice" },
  { key: "writing", href: "/writing", label: "כתיבה", icon: ICON.writing, core: false, group: "practice" },
  { key: "vocabulary", href: "/vocabulary", label: "אוצר המילים שלי", icon: ICON.vocabulary, core: false, group: "track" },
  { key: "achievements", href: "/achievements", label: "הישגים", icon: ICON.achievements, core: false, group: "track" },
];

/** The practice hub aggregates the practice group into one standalone entry. */
export const PRACTICE_HUB: Activity = {
  key: "practice",
  href: "/practice",
  label: "תרגול",
  icon: ICON.practice,
  core: true,
  group: "practice",
};

export const ACTIVITY: Record<string, Activity> = Object.fromEntries(
  [...ACTIVITIES, PRACTICE_HUB].map((a) => [a.key, a])
);

export function activitiesInGroup(group: ActivityGroup): Activity[] {
  return ACTIVITIES.filter((a) => a.group === group);
}

/** Menu-card emphasis derives from whether an activity is core. */
export function emphasisFor(activity: Activity): "solid" | "soft" {
  return activity.core ? "solid" : "soft";
}
