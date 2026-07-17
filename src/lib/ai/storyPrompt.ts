import { STORY_MAX_QUESTIONS, STORY_MAX_SEGMENTS, STORY_MIN_QUESTIONS, STORY_MIN_SEGMENTS } from "@/lib/constants";

export const SUBMIT_STORY_TOOL = {
  name: "submit_story",
  description:
    "Return a short story (in Hebrew-script transliterated Arabic) built from the supplied vocabulary, plus reading-comprehension questions.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      theme: {
        type: "string",
        description:
          "תווית קצרה (1-3 מילים) לנושא/רקע הסיפור, למשל: שוק, טיול משפחתי, יום עבודה, מסעדה.",
      },
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
    required: ["title", "theme", "segments", "questions"],
  },
} as const;

interface VocabForPrompt {
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: string;
}

const LEVEL_GUIDANCE: Record<number, string> = {
  1: "רמה 1 (מתחילים): משפטים קצרים מאוד ופשוטים, אוצר מילים בסיסי, עלילה ישירה וברורה.",
  2: "רמה 2: משפטים קצרים עם מעט יותר פירוט וכמה מילות קישור, עלילה פשוטה עם רצף אירועים ברור.",
  3: "רמה 3: משפטים באורך בינוני, עלילה עשירה יותר עם סיבה ותוצאה, ושאלות הבנה שדורשות מסקנה קלה.",
  4: "רמה 4 (מתקדם): משפטים מלאים ומגוונים, עלילה עם כמה שלבים, ושאלות הבנת הנקרא שדורשות הסקה והבנה מעמיקה.",
};

export function buildStorySystemPrompt(level: number): string {
  const levelText = LEVEL_GUIDANCE[level] ?? LEVEL_GUIDANCE[1];
  return `אתה כותב סיפור קצר ושאלות הבנת הנקרא לאפליקציה לתרגול ערבית מדוברת, עבור דובר עברית.

הסיפור כולו חייב להיות בתעתיק עברי של ערבית מדוברת (כפי שמופיע בעמודה arabicTranslit), ברמת הקושי הנדרשת (${levelText}), ומחולק לקטעים קצרים (segments) - כל קטע משפט אחד או שניים. לכל קטע ספק תרגום מדויק לעברית בשדה hebrewMeaning. שלב באופן טבעי כמה שיותר מילים וביטויים מרשימת אוצר המילים שסופקה לך, בלי להמציא תוכן מנותק מהרשימה. מותר להשתמש גם במילות קישור/דקדוק בסיסיות שאינן ברשימה כדי לבנות משפטים תקינים ועלילה קולחת.

בחר לכל סיפור נושא/רקע אחד מתוך הקטגוריות הבאות (או קטגוריה דומה): בית, שוק, עבודה, טיול, מסעדה, בית ספר, חברים, מזג אוויר, קניות, בריאות, ספורט, חגיגה/אירוע משפחתי. אל תשתמש בגינה, עצי זית, פרחים או כפר כרקע ברירת מחדל - רק אם הם ממש נדרשים לפי אוצר המילים ואין ברירה אחרת. דווח על הנושא שבחרת בשדה theme (1-3 מילים). חשוב: גם אם אותן מילות אוצר מתאימות ליותר מנושא אחד, שלב אותן בתוך הנושא שנבחר - אל תיתן למילים להכתיב חזרה לאותו רקע בכל פעם.

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

export function buildStoryUserMessage(vocab: VocabForPrompt[], recentThemes: string[]): string {
  const list = vocab
    .map((v) => `- תעתיק: ${v.arabicTranslit} | פירוש: ${v.hebrewMeaning} | סוג: ${v.itemType}`)
    .join("\n");
  const historyNote =
    recentThemes.length > 0
      ? `הנושאים הבאים שימשו לאחרונה ואסור לבחור אחד מהם או משהו דומה להם עבור שדה theme: ${recentThemes.join(", ")}. בחר נושא שונה לגמרי.`
      : "זהו הסיפור הראשון - אין נושאים קודמים להימנע מהם.";
  return `הנה רשימת אוצר המילים האישי (${vocab.length} פריטים):\n\n${list}\n\n${historyNote}\n\nכתוב סיפור קצר ושאלות הבנה כפי שהוסבר.`;
}
