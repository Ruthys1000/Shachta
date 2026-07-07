import { STORY_MAX_QUESTIONS, STORY_MAX_SEGMENTS, STORY_MIN_QUESTIONS, STORY_MIN_SEGMENTS } from "@/lib/constants";

export const SUBMIT_STORY_TOOL = {
  name: "submit_story",
  description:
    "Return a short story (in Hebrew-script transliterated Arabic) built from the supplied vocabulary, plus reading-comprehension questions.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      segments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            arabicTranslit: { type: "string" },
            hebrewMeaning: { type: "string" },
          },
          required: ["arabicTranslit", "hebrewMeaning"],
        },
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            questionHebrew: { type: "string" },
            correctAnswer: { type: "string" },
            options: { type: "array", items: { type: "string" } },
          },
          required: ["question", "questionHebrew", "correctAnswer", "options"],
        },
      },
    },
    required: ["title", "segments", "questions"],
  },
} as const;

interface VocabForPrompt {
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: string;
}

export function buildStorySystemPrompt(): string {
  return `אתה כותב סיפור קצר ושאלות הבנת הנקרא לאפליקציה לתרגול ערבית מדוברת, עבור דובר עברית.

הסיפור כולו חייב להיות בתעתיק עברי של ערבית מדוברת (כפי שמופיע בעמודה arabicTranslit), ברמת מתחילים, ומחולק לקטעים קצרים (segments) - כל קטע משפט אחד או שניים. לכל קטע ספק תרגום מדויק לעברית בשדה hebrewMeaning. שלב באופן טבעי כמה שיותר מילים וביטויים מרשימת אוצר המילים שסופקה לך, בלי להמציא תוכן מנותק מהרשימה. מותר להשתמש גם במילות קישור/דקדוק בסיסיות שאינן ברשימה כדי לבנות משפטים תקינים ועלילה קולחת.

גוון בכל פעם את נושא העלילה, הדמויות והרקע (למשל: בית, שוק, עבודה, טיול, מסעדה, משפחה, חברים, מזג אוויר, קניות, בריאות, ולא רק אחד מהם שוב ושוב) - אל תתקבע על אותו נושא בכל פעם, גם אם אותן מילות אוצר מתאימות ליותר מנושא אחד.

אחרי הסיפור, כתוב שאלות הבנת הנקרא (questions) על תוכן הסיפור עצמו - מה קרה, מי עשה מה, למה, ומה התוצאה - ולא שאלות שחזור מילים. השאלה עצמה (question) חייבת להיות בתעתיק עברי של ערבית, עם תרגום מדויק לעברית בשדה questionHebrew. התשובה הנכונה (correctAnswer) חייבת להיות תשובה קצרה (מילה עד ארבע מילים) בתעתיק עברי של ערבית, מבוססת על הבנת הסיפור.

לכל שאלה ספק בשדה options בדיוק 4 אפשרויות תשובה בתעתיק עברי של ערבית: אחת מהן היא בדיוק התשובה הנכונה (correctAnswer, אות באות), והשלוש הנותרות הן תשובות שגויות אך סבירות (מבוססות על תוכן הסיפור, לא מומצאות משום מקום אחר). ערבב את סדר האפשרויות כך שהתשובה הנכונה לא תמיד תהיה במקום קבוע.

אסור בהחלט:
- שאלות שהתשובה עליהן היא העתקה מילה-במילה של משפט שלם מהסיפור.
- שאלות שהתשובה עליהן היא מילת אוצר מילים בודדת שמופיעה כפי שהיא בטקסט.
- שאלות כן/לא.
- כל טקסט בכתב ערבי (אותיות ערביות) בשום שדה - רק עברית ותעתיק עברי מותרים.
- חוסר התאם דקדוקי במין בין שם עצם לתואר/פועל שמתאר אותו (לדוגמה "מדינה כביר" שגוי, "מדינה כבירה" נכון כי "מדינה" נקבה) - ודא התאמה במין ובמספר בכל משפט.

לדוגמה: שאלה גרועה (העתקה מילולית) - "מה אמרה אמא לילד?" עם תשובה שהיא פשוט המשפט שאמא אמרה כפי שהוא מופיע בסיפור. שאלה טובה (מסקנה/הבנה) - "למה הילד היה שמח בסוף הסיפור?" עם תשובה קצרה שמסכמת את הסיבה במילים שלך, לא ציטוט.

צור בין ${STORY_MIN_SEGMENTS} ל-${STORY_MAX_SEGMENTS} קטעים לסיפור, ובין ${STORY_MIN_QUESTIONS} ל-${STORY_MAX_QUESTIONS} שאלות הבנה.`;
}

export function buildStoryUserMessage(vocab: VocabForPrompt[], recentTitles: string[]): string {
  const list = vocab
    .map((v) => `- תעתיק: ${v.arabicTranslit} | פירוש: ${v.hebrewMeaning} | סוג: ${v.itemType}`)
    .join("\n");
  const historyNote =
    recentTitles.length > 0
      ? `כותרות של סיפורים קודמים (אל תחזור על אותו נושא/עלילה - בחר נושא שונה): ${recentTitles.join(", ")}.`
      : "זהו הסיפור הראשון - אין סיפורים קודמים להימנע מהם.";
  return `הנה רשימת אוצר המילים האישי (${vocab.length} פריטים):\n\n${list}\n\n${historyNote}\n\nכתוב סיפור קצר ושאלות הבנה כפי שהוסבר.`;
}
