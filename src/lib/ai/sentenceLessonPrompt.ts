import {
  SENTENCE_LESSON_MAX_EXAMPLES,
  SENTENCE_LESSON_MAX_EXERCISES,
  SENTENCE_LESSON_MIN_EXAMPLES,
  SENTENCE_LESSON_MIN_EXERCISES,
} from "@/lib/constants";

export const SUBMIT_SENTENCE_LESSON_TOOL = {
  name: "submit_sentence_lesson",
  description:
    "Return a single sentence-building grammar lesson (in Hebrew, with Hebrew-script transliterated Arabic examples) built from the supplied vocabulary, plus build-the-sentence practice exercises.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      ruleExplanation: { type: "string" },
      examples: {
        type: "array",
        items: {
          type: "object",
          properties: {
            arabicTranslit: { type: "string" },
            hebrewMeaning: { type: "string" },
            words: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  arabicTranslit: { type: "string" },
                  hebrewMeaning: { type: "string" },
                  role: { type: "string" },
                },
                required: ["arabicTranslit", "hebrewMeaning", "role"],
              },
            },
          },
          required: ["arabicTranslit", "hebrewMeaning", "words"],
        },
      },
      exercises: {
        type: "array",
        items: {
          type: "object",
          properties: {
            hebrewMeaning: { type: "string" },
            correctOrder: { type: "array", items: { type: "string" } },
          },
          required: ["hebrewMeaning", "correctOrder"],
        },
      },
    },
    required: ["title", "ruleExplanation", "examples", "exercises"],
  },
} as const;

interface VocabForPrompt {
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: string;
}

const LEVEL_GUIDANCE: Record<number, string> = {
  1: "רמה 1 (התחלה): משפטים קצרים מאוד, 2-3 מילים, המבנה הכי בסיסי האפשרי של הכלל.",
  2: "רמה 2: משפטים בני 3-4 מילים. אפשר לשלב רכיב נוסף אחד (תואר, כינוי גוף או מילת קישור) מעבר לכלל המרכזי.",
  3: "רמה 3: משפטים בני 4-6 מילים. אפשר לשלב כמה רכיבים נוספים (למשל יותר מתואר אחד, או מילת קישור ומילת שלילה יחד) בנוסף לכלל המרכזי.",
  4: "רמה 4 (מתקדם): משפטים בני 5-8 מילים, יכולים לשלב את הכלל המרכזי עם כלל נוסף שכבר נלמד בעבר, ליצירת משפטים מורכבים ועשירים יותר.",
};

export function buildSentenceLessonSystemPrompt(level: number): string {
  const levelText = LEVEL_GUIDANCE[level] ?? LEVEL_GUIDANCE[1];
  return `אתה מורה לערבית מדוברת, בונה שיעור קצר על חוק אחד של בניית משפט, לאפליקציה לתרגול אישי עבור דובר עברית.

תפקידך: לבחור **כלל בנייה אחד בלבד** המתאים לרמת מתחילים, שאפשר להדגים אותו היטב באמצעות אוצר המילים שסופק לך. למשל (לבחירתך, בהתאם למה שמתאים לרשימה): סדר נושא-פועל-מושא במשפט פשוט, מיקום תואר אחרי שם העצם שהוא מתאר, בניית שלילה עם "מש"/"מא", בניית שאלה עם מילת שאלה בתחילת המשפט, חיבור כינוי גוף לפועל, יידוע/סמיכות בין שני שמות עצם. בחר כלל אחד שמתאים בצורה הטובה ביותר למילים שיש ברשימה - אל תמציא כלל שאין לו דוגמאות טובות מהרשימה.

מבנה השיעור שעליך להחזיר:

1. title - שם קצר לכלל בעברית (למשל "סדר מילים במשפט עם פועל").
2. ruleExplanation - הסבר ברור ופשוט בעברית, ברמת מתחילים, של הכלל: איך בונים את המשפט, מה הסדר, ולמה. כמה משפטים, לא יותר מפסקה קצרה אחת.
3. examples - בין ${SENTENCE_LESSON_MIN_EXAMPLES} ל-${SENTENCE_LESSON_MAX_EXAMPLES} משפטי דוגמה שמדגימים את הכלל. כל דוגמה כוללת:
   - arabicTranslit: המשפט המלא בתעתיק עברי.
   - hebrewMeaning: תרגום מדויק של המשפט המלא לעברית.
   - words: פירוק המשפט מילה-מילה (או צירוף קצר במקרה הצורך), כל מילה עם arabicTranslit, hebrewMeaning (הפירוש של אותה מילה בלבד) ו-role - תווית קצרה בעברית לתפקיד הדקדוקי של המילה במשפט (למשל "נושא", "פועל", "מושא", "תואר", "מילת שלילה", "מילת שאלה", "מילת קישור").
4. exercises - בין ${SENTENCE_LESSON_MIN_EXERCISES} ל-${SENTENCE_LESSON_MAX_EXERCISES} תרגילי הרכבת משפט, המדגימים את **אותו כלל בדיוק** עם מילים אחרות (או צירופים אחרים) מהרשימה. כל תרגיל כולל:
   - hebrewMeaning: המשפט שהמשתמשת צריכה להרכיב, בעברית בלבד.
   - correctOrder: מערך של המילים בתעתיק עברי, בדיוק בסדר הנכון שבו יש להרכיב אותן כדי לקבל משפט תקין לפי הכלל. כל איבר במערך הוא מילה אחת (או צירוף קצר בלתי-נפרד כמו "פי" + שם עצם אם זה טבעי יותר). לפחות 2 איברים בכל תרגיל.

חשוב מאוד:
- אסור בהחלט להחזיר טקסט בכתב ערבי בשום שדה - רק עברית ותעתיק עברי (כתב עברי) מותרים בכל מקום.
- אסור להמציא מילים או משמעויות שלא קשורות לרשימת אוצר המילים שסופקה. השתמש במילים מהרשימה ככל האפשר. מותר להוסיף מילות קישור/דקדוק בסיסיות שאינן ברשימה (כמו כינויי גוף, מילות שלילה, מילות שאלה) כדי לבנות משפטים תקינים, ובלבד שהן חלק טבעי מהכלל הנלמד.
- ה-exercises חייבים להדגים את אותו הכלל בדיוק שהוסבר ב-ruleExplanation ושמודגם ב-examples - לא כלל אחר.
- שים לב להתאם דקדוקי בין מין שם העצם למין התואר/הפועל שמתאר אותו: שם עצם בלשון נקבה דורש תואר בלשון נקבה. לדוגמה: "מדינה כבירה" נכון, "מדינה כביר" שגוי (כי "מדינה" נקבה). ודא שכל זוג שם עצם+תואר וכל פועל מתואמים במין ובמספר בכל המשפטים, הדוגמאות והתרגילים.

רמת הקושי הנדרשת לשיעור הזה: ${levelText}`;
}

export function buildSentenceLessonUserMessage(vocab: VocabForPrompt[], recentTitles: string[]): string {
  const list = vocab
    .map((v) => `- תעתיק: ${v.arabicTranslit} | פירוש: ${v.hebrewMeaning} | סוג: ${v.itemType}`)
    .join("\n");
  const historyNote =
    recentTitles.length > 0
      ? `כללים שכבר נלמדו בשיעורים קודמים (אל תחזור על אף אחד מהם - בחר כלל אחר): ${recentTitles.join(", ")}.`
      : "זהו השיעור הראשון - אין כללים קודמים להימנע מהם.";
  return `הנה רשימת אוצר המילים האישי (${vocab.length} פריטים):\n\n${list}\n\n${historyNote}\n\nבנה שיעור על כלל בניית משפט אחד כפי שהוסבר, על בסיס הרשימה הזו.`;
}
