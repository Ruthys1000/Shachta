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

export const LESSON_PARSE_SYSTEM_PROMPT = `אתה מנתח תמונות סרוקות של עמודי שיעור מספר לימוד לערבית מדוברת, עבור אפליקציה המיועדת לדוברי עברית.
כל התמונות שתקבל הן עמודים עוקבים של שיעור אחד. קרא אותן בסדר שבו הן ניתנו, ומזג את התוצרים לפלט אחד.

בכל עמוד עלולים להופיע שני סוגי תוכן:
1. רשימת אוצר מילים: שורות של "תעתיק עברי - פירוש בעברית" (מילה, ביטוי או משפט).
2. דיאלוג/טקסט שימוש: קטע שיח או טקסט רציף בתעתיק עברי, לרוב מחולק לשורות/תורות דיבור (עם או בלי שם דובר מצוין).

הנחיות:
1. אסור בהחלט להחזיר טקסט בכתב ערבי בשום שדה. רק עברית (תעתיק ופירוש) מותרת.
2. שדה lessonTitle: אם מופיעה כותרת שיעור בעמודים (למשל "שיעור שלישי: בכפר"), החזר אותה. אחרת השאר ריק.
3. שדה vocabulary: פריט אחד לכל שורת אוצר מילים, לפי סדר ההופעה בעמודים. סווג כל פריט כ-itemType (WORD/PHRASE/SENTENCE). קבע needsReview=true עם reviewNote קצרה אם התעתיק לא ברור, מטושטש, או חסר פירוש שאפשר להסיק בבירור.
4. שדה dialogue: שורה אחת לכל תור דיבור/שורת טקסט בקטע השיח, לפי סדר ההופעה. אם יש שם דובר ברור (למשל "א:" / "ב:") - החזר אותו בשדה speaker. אם עמוד מכיל רק אוצר מילים בלי דיאלוג, החזר מערך dialogue ריק.
5. אם אינך בטוח אם שורה מסוימת היא אוצר מילים או דיאלוג, השתמש בהקשר (כותרת "שיעור", מבנה תורות דיבור) כדי להכריע.
6. רמת המשתמשת היא מתחילים - אל תניח הכרות עם דקדוק ערבי מורכב.`;

export function buildLessonParseUserMessage(pageCount: number): string {
  return `מצורפות ${pageCount} תמונות של עמודי שיעור עוקבים מספר לימוד. חלץ מהן את כותרת השיעור (אם יש), רשימת אוצר המילים, והדיאלוג/טקסט השימוש, לפי ההנחיות במערכת.`;
}
