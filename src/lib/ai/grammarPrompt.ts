import { GRAMMAR_LESSON_MAX_EXERCISES, GRAMMAR_LESSON_MIN_EXERCISES } from "@/lib/constants";

export const SUBMIT_GRAMMAR_LESSON_TOOL = {
  name: "submit_grammar_lesson",
  description:
    "Return a single verb-conjugation grammar lesson (in Hebrew, with Hebrew-script transliterated Arabic forms) for a required pronoun/tense combination, plus multiple-choice practice exercises.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      ruleExplanation: { type: "string" },
      conjugationExamples: {
        type: "array",
        items: {
          type: "object",
          properties: {
            pronoun: { type: "string" },
            arabicTranslit: { type: "string" },
            hebrewMeaning: { type: "string" },
          },
          required: ["pronoun", "arabicTranslit", "hebrewMeaning"],
        },
      },
      exercises: {
        type: "array",
        items: {
          type: "object",
          properties: {
            promptHebrew: { type: "string" },
            correctAnswer: { type: "string" },
            options: { type: "array", items: { type: "string" } },
          },
          required: ["promptHebrew", "correctAnswer", "options"],
        },
      },
    },
    required: ["title", "ruleExplanation", "conjugationExamples", "exercises"],
  },
} as const;

interface VocabForPrompt {
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: string;
}

const LEVEL_GUIDANCE: Record<number, string> = {
  1: "רמה 1 (התחלה): התייחס לכל צורה בנפרד, בלי הקשר משפט - פשוט 'איך אומרים את הפועל X בגוף/זמן הזה'.",
  2: "רמה 2: אפשר לשלב את הצורה בתוך משפט קצר מאוד (2-3 מילים) כדי לתת הקשר.",
  3: "רמה 3: שלב את הצורה בתוך משפט קצר (3-5 מילים) עם מילת זמן או מושא פשוט.",
  4: "רמה 4 (מתקדם): שלב את הצורה בתוך משפט מלא קצר (4-6 מילים), ואפשר לערבב בתרגילים גם צורות מפעלים שונים שנלמדו בעבר לצורך חזרה.",
};

export function buildGrammarSystemPrompt(level: number, tense: string, pronouns: string[]): string {
  const levelText = LEVEL_GUIDANCE[level] ?? LEVEL_GUIDANCE[1];
  const pronounList = pronouns.join(", ");
  return `אתה מורה לערבית מדוברת, בונה שיעור נטיית פועל קצר לאפליקציה לתרגול אישי עבור דובר עברית.

השיעור הזה **חייב** להתמקד אך ורק בזמן "${tense}" ובגופים הבאים בדיוק: ${pronounList}. אסור לסטות מהם, להוסיף גוף אחר, או לשנות זמן - הבחירה הזו נקבעה מראש כדי להבטיח כיסוי שיטתי של כל הגופים והזמנים לאורך זמן.

מבנה השיעור שעליך להחזיר:

1. title - שם קצר בעברית לשיעור (למשל "נטיית פועל בזמן עבר - אני, אתה, היא").
2. ruleExplanation - הסבר ברור ופשוט בעברית, ברמת מתחילים, של דפוס הנטייה בזמן "${tense}" עבור הגופים שצוינו: איך הצורה משתנה בין הגופים, מה הקידומת/סיומת האופיינית לכל גוף. כמה משפטים, לא יותר מפסקה קצרה אחת.
3. conjugationExamples - בדיוק שורה אחת לכל אחד מהגופים ${pronounList} (${pronouns.length} שורות בסך הכל), כולן לאותו פועל אחד לדוגמה שתבחר (עדיף פועל מרשימת אוצר המילים שסופקה, ואם אין ברשימה פועל מתאים - מותר להשתמש בפועל בסיסי ונפוץ שאינו ברשימה). כל שורה כוללת:
   - pronoun: אחד מהגופים ${pronounList} (בדיוק כפי שכתוב כאן, בעברית).
   - arabicTranslit: צורת הפועל הנטויה עבור אותו גוף, בתעתיק עברי של ערבית מדוברת.
   - hebrewMeaning: התרגום המדויק לעברית של אותה צורה (למשל "אני כתבתי").
4. exercises - בין ${GRAMMAR_LESSON_MIN_EXERCISES} ל-${GRAMMAR_LESSON_MAX_EXERCISES} תרגילי בחירה מרובה, על אותו זמן וגופים בדיוק, אבל על 2-3 פעלים שונים (יכול לכלול את הפועל מה-conjugationExamples וגם פעלים נוספים מרשימת אוצר המילים, כדי שלא יהיה שינון של פועל בודד). כל תרגיל כולל:
   - promptHebrew: שאלה קצרה וברורה בעברית בלבד, למשל 'איך אומרים "היא כתבה" (זמן עבר, גוף היא)?' - ציין בשאלה את המשמעות בעברית, הגוף והזמן.
   - correctAnswer: הצורה הנטויה הנכונה בתעתיק עברי של ערבית.
   - options: בדיוק 4 אפשרויות בתעתיק עברי, אחת מהן היא בדיוק correctAnswer, והשלוש הנותרות הן צורות שגויות אך סבירות - למשל אותו פועל בגוף אחר מתוך ${pronounList}, אותו פועל בזמן אחר, או טעות נטייה נפוצה. אל תשתמש במילים אקראיות שלא קשורות לפועל.

חשוב מאוד:
- אסור בהחלט להחזיר טקסט בכתב ערבי בשום שדה - רק עברית ותעתיק עברי (כתב עברי) מותרים בכל מקום.
- ודא התאם דקדוקי נכון: לגוף נקבה יחיד (את/היא) ולגוף רבים (אנחנו/אתם/הם) יש סיומות שונות מגוף זכר יחיד - הקפד על כך בכל הצורות.
- אם אתה משווה לעברית, ההשוואה חייבת להיות נכונה עובדתית. אם אינך בטוח, הסבר את הדפוס בלי להשוות לעברית בכלל.

רמת הקושי הנדרשת לתרגילים: ${levelText}`;
}

export function buildGrammarUserMessage(vocab: VocabForPrompt[], tense: string, pronouns: string[]): string {
  const list = vocab
    .map((v) => `- תעתיק: ${v.arabicTranslit} | פירוש: ${v.hebrewMeaning} | סוג: ${v.itemType}`)
    .join("\n");
  return `הנה רשימת אוצר המילים האישי (${vocab.length} פריטים), לבחירת פעלים מתוכה במידת האפשר:\n\n${list}\n\nבנה שיעור נטיית פועל בזמן "${tense}" עבור הגופים ${pronouns.join(", ")} בלבד - שורת נטייה אחת לכל גוף (${pronouns.length} שורות בסך הכל), ובין ${GRAMMAR_LESSON_MIN_EXERCISES} ל-${GRAMMAR_LESSON_MAX_EXERCISES} תרגילי בחירה מרובה, כפי שהוסבר.`;
}
