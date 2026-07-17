export const SUBMIT_QUIZ_TOOL = {
  name: "submit_quiz",
  description: "Return a freshly generated quiz built strictly from the supplied vocabulary list.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: [
                "translation_ar_he",
                "translation_he_ar",
                "fill_in_blank",
                "multiple_choice",
                "meaning_id",
                "scenario",
              ],
            },
            question: { type: "string" },
            correctAnswer: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            sourceVocabId: { type: "string" },
          },
          required: ["type", "question", "correctAnswer", "sourceVocabId"],
        },
      },
    },
    required: ["title", "questions"],
  },
} as const;

interface VocabForPrompt {
  id: string;
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: string;
}

const LEVEL_GUIDANCE: Record<number, string> = {
  1: "רמה 1 (מתחילים): שאלות ישירות ופשוטות - בעיקר תרגום מילה בודדת והתאמת פירוש, ניסוח קצר וברור.",
  2: "רמה 2: אפשר לשלב שאלות השלמת חסר וזיהוי משמעות בהקשר קצר, מעבר לתרגום ישיר.",
  3: "רמה 3: העדף שאלות בהקשר - השלמת חסר במשפט, מצבים (scenario) קצרים, ובחירה בין הסחות דעת קרובות.",
  4: "רמה 4 (מתקדם): שאלות מאתגרות עם הקשר עשיר יותר ומצבים, הסחות דעת עדינות שדורשות הבנה מדויקת ולא ניחוש.",
};

export function buildQuizSystemPrompt(allowMultipleChoice: boolean, level: number): string {
  const levelText = LEVEL_GUIDANCE[level] ?? LEVEL_GUIDANCE[1];
  return `אתה בונה מבדק תרגול לאפליקציה לתרגול ערבית מדוברת, עבור דובר עברית שרוצה לתרגל את אוצר המילים האישי שלו.

אסור בהחלט להחזיר טקסט בכתב ערבי בשום שדה (שאלה, תשובה, אפשרות). רק עברית ותעתיק עברי מותרים.

אסור להמציא מילים, ביטויים או משפטים בערבית שלא נמצאים ברשימת אוצר המילים שסופקה לך. כל שאלה חייבת להתבסס על פריט קיים אחד מהרשימה, ולציין את ה-id שלו בשדה sourceVocabId בדיוק כפי שניתן.

סוגי שאלות אפשריים:
- translation_ar_he: הצג את התעתיק הערבי, התשובה הנכונה היא הפירוש בעברית.
- translation_he_ar: הצג את הפירוש בעברית, התשובה הנכונה היא התעתיק הערבי.
- fill_in_blank: משפט או ביטוי עם חלק חסר שהמשתמש צריך להשלים.
- multiple_choice: שאלה עם 4 אפשרויות בדיוק (אחת נכונה, 3 שגויות אך סבירות), כל האפשרויות בעברית/תעתיק.
- meaning_id: זיהוי הפירוש הנכון מתוך כמה אפשרויות.
- scenario: תיאור מצב קצר בעברית והמשתמש צריך לבחור/לכתוב את הביטוי המתאים בתעתיק ערבי.

${allowMultipleChoice ? "" : "אין מספיק מילים שונות במאגר כדי לבנות הסחות דעת אמינות - אל תכלול שאלות multiple_choice במבדק הזה."}

ודא גיוון בין סוגי השאלות ובין הפריטים מהרשימה.

רמת הקושי הנדרשת למבדק הזה: ${levelText}`;
}

export function buildQuizUserMessage(vocab: VocabForPrompt[], questionCount: number): string {
  const list = vocab
    .map((v) => `- id: ${v.id} | תעתיק: ${v.arabicTranslit} | פירוש: ${v.hebrewMeaning} | סוג: ${v.itemType}`)
    .join("\n");
  return `הנה רשימת אוצר המילים האישי המלאה (${vocab.length} פריטים):\n\n${list}\n\nבנה מבדק עם ${questionCount} שאלות בדיוק, כל שאלה מבוססת על פריט אחד מהרשימה לעיל בלבד.`;
}
