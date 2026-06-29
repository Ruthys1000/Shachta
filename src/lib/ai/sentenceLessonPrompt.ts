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

export function buildSentenceLessonSystemPrompt(): string {
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
- כוון לרמת מתחילים מוחלטים: משפטים קצרים ופשוטים.`;
}

export function buildSentenceLessonUserMessage(vocab: VocabForPrompt[]): string {
  const list = vocab
    .map((v) => `- תעתיק: ${v.arabicTranslit} | פירוש: ${v.hebrewMeaning} | סוג: ${v.itemType}`)
    .join("\n");
  return `הנה רשימת אוצר המילים האישי (${vocab.length} פריטים):\n\n${list}\n\nבנה שיעור על כלל בניית משפט אחד כפי שהוסבר, על בסיס הרשימה הזו.`;
}
