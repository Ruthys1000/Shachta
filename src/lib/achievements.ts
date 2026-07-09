import type { GamificationStats } from "@/lib/gamification";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  getCurrent: (stats: GamificationStats) => number;
}

export interface AchievementResult extends AchievementDefinition {
  current: number;
  unlocked: boolean;
  percent: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "VOCAB_10",
    title: "צעדים ראשונים",
    description: "הוספת 10 מילים לאוצר המילים שלך 🌱",
    icon: "Sprout",
    target: 10,
    getCurrent: (stats) => stats.vocabularyCount,
  },
  {
    id: "VOCAB_50",
    title: "אוסף מתרחב",
    description: "50 מילים באוצר — את בונה שפה שלמה",
    icon: "Layers",
    target: 50,
    getCurrent: (stats) => stats.vocabularyCount,
  },
  {
    id: "VOCAB_100",
    title: "מאה מילים!",
    description: "100 מילים באוצר המילים שלך, וואו 🎉",
    icon: "Gem",
    target: 100,
    getCurrent: (stats) => stats.vocabularyCount,
  },
  {
    id: "VOCAB_250",
    title: "אלופת האוצר",
    description: "250 מילים — אוצר מילים מרשים באמת",
    icon: "Crown",
    target: 250,
    getCurrent: (stats) => stats.vocabularyCount,
  },
  {
    id: "VOCAB_500",
    title: "אספנית על",
    description: "500 מילים באוצר — אוסף מרשים באמת",
    icon: "Diamond",
    target: 500,
    getCurrent: (stats) => stats.vocabularyCount,
  },
  {
    id: "VOCAB_1000",
    title: "אלף מילים!",
    description: "1000 מילים באוצר המילים שלך — הישג ענק",
    icon: "Trophy",
    target: 1000,
    getCurrent: (stats) => stats.vocabularyCount,
  },
  {
    id: "CORRECT_25",
    title: "מתחילה בטוחה",
    description: "25 תשובות נכונות במבדקים",
    icon: "Target",
    target: 25,
    getCurrent: (stats) => stats.totalCorrect,
  },
  {
    id: "CORRECT_100",
    title: "תרגול מתמיד",
    description: "100 תשובות נכונות — הידע נטמע",
    icon: "CheckCircle2",
    target: 100,
    getCurrent: (stats) => stats.totalCorrect,
  },
  {
    id: "CORRECT_300",
    title: "ידע מוצק",
    description: "300 תשובות נכונות במבדקים",
    icon: "Medal",
    target: 300,
    getCurrent: (stats) => stats.totalCorrect,
  },
  {
    id: "CORRECT_750",
    title: "מאסטרית התרגול",
    description: "750 תשובות נכונות, מרשים!",
    icon: "Star",
    target: 750,
    getCurrent: (stats) => stats.totalCorrect,
  },
  {
    id: "CORRECT_1500",
    title: "מומחית תרגול",
    description: "1500 תשובות נכונות במבדקים",
    icon: "GraduationCap",
    target: 1500,
    getCurrent: (stats) => stats.totalCorrect,
  },
  {
    id: "LESSON_1",
    title: "המשפט הראשון",
    description: "השלמת שיעור בניית משפטים ראשון",
    icon: "Puzzle",
    target: 1,
    getCurrent: (stats) => stats.lessonsCompleted,
  },
  {
    id: "LESSON_5",
    title: "בונה משפטים",
    description: "5 שיעורי בניית משפטים הושלמו",
    icon: "Blocks",
    target: 5,
    getCurrent: (stats) => stats.lessonsCompleted,
  },
  {
    id: "LESSON_15",
    title: "אלופת התחביר",
    description: "15 שיעורי בניית משפטים — התחביר בכיס",
    icon: "Award",
    target: 15,
    getCurrent: (stats) => stats.lessonsCompleted,
  },
  {
    id: "LESSON_30",
    title: "בקיאה בתחביר",
    description: "30 שיעורי בניית משפטים הושלמו",
    icon: "BookMarked",
    target: 30,
    getCurrent: (stats) => stats.lessonsCompleted,
  },
  {
    id: "LESSON_50",
    title: "מאסטרית משפטים",
    description: "50 שיעורי בניית משפטים — שליטה מלאה",
    icon: "Rocket",
    target: 50,
    getCurrent: (stats) => stats.lessonsCompleted,
  },
  {
    id: "GRAMMAR_1",
    title: "הנטייה הראשונה",
    description: "השלמת שיעור דקדוק ראשון על גופים וזמנים",
    icon: "SpellCheck2",
    target: 1,
    getCurrent: (stats) => stats.grammarLessonsCompleted,
  },
  {
    id: "GRAMMAR_5",
    title: "מכירה את הגופים",
    description: "5 שיעורי דקדוק הושלמו",
    icon: "Users",
    target: 5,
    getCurrent: (stats) => stats.grammarLessonsCompleted,
  },
  {
    id: "GRAMMAR_15",
    title: "אלופת הזמנים",
    description: "15 שיעורי דקדוק — עבר, הווה ועתיד בכיס",
    icon: "History",
    target: 15,
    getCurrent: (stats) => stats.grammarLessonsCompleted,
  },
  {
    id: "GRAMMAR_30",
    title: "בקיאה בנטיות",
    description: "30 שיעורי דקדוק הושלמו",
    icon: "BookMarked",
    target: 30,
    getCurrent: (stats) => stats.grammarLessonsCompleted,
  },
  {
    id: "GRAMMAR_EXERCISE_50",
    title: "נוטה בביטחון",
    description: "50 תרגילי נטיית פועל נכונים",
    icon: "CheckSquare",
    target: 50,
    getCurrent: (stats) => stats.grammarExerciseCorrect,
  },
  {
    id: "GRAMMAR_EXERCISE_150",
    title: "מומחית נטייה",
    description: "150 תרגילי נטיית פועל נכונים",
    icon: "Hammer",
    target: 150,
    getCurrent: (stats) => stats.grammarExerciseCorrect,
  },
  {
    id: "PHRASE_10",
    title: "לומדת ביטויים",
    description: "10 ביטויים בערבית מדוברת באוצר שלך",
    icon: "MessageSquare",
    target: 10,
    getCurrent: (stats) => stats.phraseCount,
  },
  {
    id: "PHRASE_25",
    title: "אוצר ביטויים",
    description: "25 ביטויים בערבית מדוברת באוצר שלך",
    icon: "Quote",
    target: 25,
    getCurrent: (stats) => stats.phraseCount,
  },
  {
    id: "SENTENCE_10",
    title: "משפטים שלמים",
    description: "10 משפטים מלאים באוצר המילים שלך",
    icon: "ScrollText",
    target: 10,
    getCurrent: (stats) => stats.sentenceCount,
  },
  {
    id: "SENTENCE_25",
    title: "משפטים רבים",
    description: "25 משפטים מלאים באוצר המילים שלך",
    icon: "Rows3",
    target: 25,
    getCurrent: (stats) => stats.sentenceCount,
  },
  {
    id: "ATTEMPTS_500",
    title: "מתרגלת נלהבת",
    description: "500 תשובות במבדקים, תרגילי משפטים, דקדוק וסיפורים — כל ניסיון הוא למידה",
    icon: "Zap",
    target: 500,
    getCurrent: (stats) =>
      stats.totalCorrect +
      stats.totalWrong +
      stats.sentenceExerciseCorrect +
      stats.sentenceExerciseWrong +
      stats.storyQuestionCorrect +
      stats.storyQuestionWrong +
      stats.grammarExerciseCorrect +
      stats.grammarExerciseWrong,
  },
  {
    id: "ATTEMPTS_1000",
    title: "בלתי נלאית",
    description: "1000 תשובות בכל סוגי התרגול — התמדה מדהימה",
    icon: "Infinity",
    target: 1000,
    getCurrent: (stats) =>
      stats.totalCorrect +
      stats.totalWrong +
      stats.sentenceExerciseCorrect +
      stats.sentenceExerciseWrong +
      stats.storyQuestionCorrect +
      stats.storyQuestionWrong +
      stats.grammarExerciseCorrect +
      stats.grammarExerciseWrong,
  },
  {
    id: "SENTENCE_EXERCISE_50",
    title: "תרגול מדויק",
    description: "50 תרגילי הרכבת משפט נכונים בלימוד בניית משפטים",
    icon: "CheckSquare",
    target: 50,
    getCurrent: (stats) => stats.sentenceExerciseCorrect,
  },
  {
    id: "SENTENCE_EXERCISE_150",
    title: "מומחית הרכבה",
    description: "150 תרגילי הרכבת משפט נכונים",
    icon: "Hammer",
    target: 150,
    getCurrent: (stats) => stats.sentenceExerciseCorrect,
  },
  {
    id: "STORY_1",
    title: "הסיפור הראשון",
    description: "סיימת סיפור והבנת הנקרא ראשון 📖",
    icon: "BookOpenText",
    target: 1,
    getCurrent: (stats) => stats.storiesCompleted,
  },
  {
    id: "STORY_10",
    title: "אספנית סיפורים",
    description: "10 סיפורים הושלמו — איזו התמדה!",
    icon: "Library",
    target: 10,
    getCurrent: (stats) => stats.storiesCompleted,
  },
  {
    id: "STORY_25",
    title: "קוראת מושבעת",
    description: "25 סיפורים הושלמו",
    icon: "Feather",
    target: 25,
    getCurrent: (stats) => stats.storiesCompleted,
  },
  {
    id: "STORY_CORRECT_50",
    title: "מבינה את הנקרא",
    description: "50 תשובות נכונות בשאלות הבנת הנקרא",
    icon: "Glasses",
    target: 50,
    getCurrent: (stats) => stats.storyQuestionCorrect,
  },
  {
    id: "STORY_CORRECT_150",
    title: "קוראת מעמיקה",
    description: "150 תשובות נכונות בשאלות הבנת הנקרא",
    icon: "Eye",
    target: 150,
    getCurrent: (stats) => stats.storyQuestionCorrect,
  },
];

export function evaluateAchievements(stats: GamificationStats): AchievementResult[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const current = def.getCurrent(stats);
    return {
      ...def,
      current,
      unlocked: current >= def.target,
      percent: Math.min(100, Math.round((current / def.target) * 100)),
    };
  });
}
