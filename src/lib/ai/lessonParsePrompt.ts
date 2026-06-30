export const SUBMIT_LESSON_PARSE_TOOL = {
  name: "submit_lesson_parse",
  description:
    "Return the structured content extracted from one or more scanned pages of a single Arabic lesson: vocabulary list and dialogue/usage text.",
  input_schema: {
    type: "object",
    properties: {
      lessonTitle: { type: "string" },
      vocabulary: {
        type: "array",
        items: {
          type: "object",
          properties: {
            arabicTranslit: { type: "string" },
            hebrewMeaning: { type: "string" },
            itemType: { type: "string", enum: ["WORD", "PHRASE", "SENTENCE"] },
            needsReview: { type: "boolean" },
            reviewNote: { type: "string" },
          },
          required: ["arabicTranslit", "hebrewMeaning", "itemType", "needsReview"],
        },
      },
      dialogue: {
        type: "array",
        items: {
          type: "object",
          properties: {
            speaker: { type: "string" },
            arabicTranslit: { type: "string" },
            hebrewMeaning: { type: "string" },
          },
          required: ["arabicTranslit", "hebrewMeaning"],
        },
      },
    },
    required: ["vocabulary", "dialogue"],
  },
} as const;

export const LESSON_PARSE_SYSTEM_PROMPT = `אתה מנתח תמונה סרוקה של עמוד בודד מתוך שיעור בספר לימוד לערבית מדוברת, עבור אפליקציה המיועדת לדוברי עברית.
התמונה היא עמוד אחד מתוך רצף עמודים עוקבים של שיעור אחד; אתה רואה רק את העמוד הזה ואינך רואה את שאר העמודים, ולכן התייחס אך ורק לתוכן המופיע בתמונה שצורפה.

בעמוד עלולים להופיע שני סוגי תוכן:
1. רשימת אוצר מילים: שורות של "תעתיק עברי - פירוש בעברית" (מילה, ביטוי או משפט).
2. דיאלוג/טקסט שימוש: קטע שיח או טקסט רציף בתעתיק עברי, לרוב מחולק לשורות/תורות דיבור (עם או בלי שם דובר מצוין).

הנחיות:
1. אסור בהחלט להחזיר טקסט בכתב ערבי בשום שדה. רק עברית (תעתיק ופירוש) מותרת.
2. שדה lessonTitle: אם מופיעה כותרת שיעור בעמוד הזה (למשל "שיעור שלישי: בכפר"), החזר אותה. אחרת השאר ריק - ייתכן שהכותרת מופיעה בעמוד אחר שלא נראה כאן.
3. שדה vocabulary: פריט אחד לכל שורת אוצר מילים, לפי סדר ההופעה בעמוד. סווג כל פריט כ-itemType (WORD/PHRASE/SENTENCE). קבע needsReview=true עם reviewNote קצרה אם התעתיק לא ברור, מטושטש, או חסר פירוש שאפשר להסיק בבירור. אם אין אוצר מילים בעמוד, החזר מערך ריק.
4. שדה dialogue: שורה אחת לכל תור דיבור/שורת טקסט בקטע השיח, לפי סדר ההופעה. אם יש שם דובר ברור (למשל "א:" / "ב:") - החזר אותו בשדה speaker. אם העמוד מכיל רק אוצר מילים בלי דיאלוג, החזר מערך dialogue ריק.
5. אם אינך בטוח אם שורה מסוימת היא אוצר מילים או דיאלוג, השתמש בהקשר שבתוך העמוד עצמו (כותרת מקטע, מבנה תורות דיבור) כדי להכריע.
6. רמת המשתמשת היא מתחילים - אל תניח הכרות עם דקדוק ערבי מורכב.`;

export function buildLessonParseUserMessage(pageIndex: number, pageCount: number): string {
  return `מצורפת תמונה של עמוד ${pageIndex} מתוך ${pageCount} בעמודי שיעור עוקבים מספר לימוד. חלץ ממנה את כותרת השיעור (אם מופיעה בעמוד זה), רשימת אוצר המילים, והדיאלוג/טקסט השימוש שמופיעים בעמוד זה, לפי ההנחיות במערכת.`;
}
