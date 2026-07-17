import { LEARNER_MAX_LEVEL, PLACEMENT_QUESTIONS_PER_LEVEL } from "@/lib/constants";

export const SUBMIT_PLACEMENT_TEST_TOOL = {
  name: "submit_placement_test",
  description:
    "Return a graded placement test (in Hebrew, with Hebrew-script transliterated Arabic) that spans difficulty bands 1-4, used to estimate the learner's spoken-Arabic level.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            level: {
              type: "integer",
              description: "רמת הקושי של השאלה: 1 (מתחילים) עד 4 (מתקדם).",
            },
            question: { type: "string" },
            correctAnswer: { type: "string" },
            options: { type: "array", items: { type: "string" } },
          },
          required: ["level", "question", "correctAnswer", "options"],
        },
      },
    },
    required: ["title", "questions"],
  },
} as const;

interface VocabForPrompt {
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: string;
}

const LEVEL_GUIDANCE: Record<number, string> = {
  1: "רמה 1 (מתחילים): זיהוי מילה בודדת נפוצה - תרגום מילה מתעתיק ערבי לעברית או מעברית לתעתיק. אוצר יומיומי בסיסי ביותר.",
  2: "רמה 2: הבנת ביטוי או משפט קצר מאוד (2-4 מילים), או בחירת המילה הנכונה להשלמת ביטוי פשוט.",
  3: "רמה 3: בחירת נטיית הפועל הנכונה לפי גוף/זמן, או השלמת מילה נכונה במשפט של 4-6 מילים - דורש הבנת דקדוק בסיסי.",
  4: "רמה 4 (מתקדם): הבנת הנקרא של משפט מלא קצר (5-8 מילים) - שאלה על המשמעות או על מה שקרה, לא רק תרגום מילה.",
};

export function buildPlacementSystemPrompt(): string {
  const bands = Array.from({ length: LEARNER_MAX_LEVEL }, (_, i) => i + 1);
  const guidance = bands.map((b) => `- ${LEVEL_GUIDANCE[b]}`).join("\n");
  const total = LEARNER_MAX_LEVEL * PLACEMENT_QUESTIONS_PER_LEVEL;
  return `אתה בונה מבחן רמה (placement test) לאפליקציה לתרגול ערבית מדוברת, עבור דובר עברית. מטרת המבחן היא לאבחן את רמת הלומד/ת - לא לתרגל רשימת מילים ספציפית.

בנה בדיוק ${total} שאלות רב-ברירה, ${PLACEMENT_QUESTIONS_PER_LEVEL} שאלות לכל אחת מ-${LEARNER_MAX_LEVEL} רמות הקושי, בסדר עולה של קושי. לכל שאלה ציין את שדה level (1 עד ${LEARNER_MAX_LEVEL}) בהתאם לרמה שהיא בודקת.

רמות הקושי:
${guidance}

כללים לכל שאלה:
- question: ניסוח השאלה. שאלות תרגום/דקדוק - נסח בעברית, וכלול את הביטוי/המשפט בערבית בתעתיק עברי בתוך השאלה. שאלות הבנת הנקרא (רמה 4) - הצג משפט קצר בתעתיק עברי ואז שאל עליו שאלה קצרה בעברית.
- options: בדיוק 4 אפשרויות. אחת מהן זהה בדיוק ל-correctAnswer (אות באות), והשלוש הנותרות שגויות אך סבירות ולא ברורות מאליהן.
- correctAnswer: התשובה הנכונה, חייבת להופיע במדויק בתוך options.

חשוב מאוד:
- אסור בהחלט טקסט בכתב ערבי (אותיות ערביות) בשום שדה - רק עברית ותעתיק עברי (כתב עברי) מותרים.
- **בשונה משאר הפעילויות באפליקציה, מותר ואף רצוי להשתמש באוצר מילים יומיומי נפוץ בערבית מדוברת שאינו מוגבל לרשימה שסופקה** - כדי למפות את היכולת האמיתית לאורך כל טווח הרמות. הרשימה שסופקה היא רק רמז לתחומי העניין המוכרים ללומד/ת.
- ודא שהשאלות בכל רמה באמת קשות יותר מהרמה שמתחתיה, כדי שהניקוד לפי רמות יהיה משמעותי.
- ודא התאם דקדוקי במין ובמספר בכל משפט (למשל "מדינה כבירה" נכון, "מדינה כביר" שגוי).`;
}

export function buildPlacementUserMessage(vocab: VocabForPrompt[]): string {
  const list = vocab
    .map((v) => `- תעתיק: ${v.arabicTranslit} | פירוש: ${v.hebrewMeaning} | סוג: ${v.itemType}`)
    .join("\n");
  const hint =
    vocab.length > 0
      ? `הנה דגימה מאוצר המילים המוכר ללומד/ת (${vocab.length} פריטים), כרמז לתחומי עניין - אינך חייב להשתמש בהם:\n\n${list}`
      : "אין עדיין אוצר מילים אישי - בנה את המבחן על בסיס אוצר ערבית מדוברת יומיומי נפוץ.";
  return `${hint}\n\nבנה כעת את מבחן הרמה המדורג כפי שהוסבר.`;
}
