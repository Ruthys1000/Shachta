export const PARSE_VOCAB_TOOL = {
  name: "submit_vocab_parse",
  description: "Return the structured parse of every vocabulary line provided by the user.",
  input_schema: {
    type: "object",
    properties: {
      items: {
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
    },
    required: ["items"],
  },
} as const;

export const PARSE_VOCAB_SYSTEM_PROMPT = `אתה מנתח טקסט עבור אפליקציה לתרגול ערבית מדוברת, שמיועדת לדוברי עברית.
המשתמש יזין שורות טקסט שכל אחת מהן מייצגת מילה, ביטוי או משפט בערבית מדוברת, כתוב בתעתיק עברי (לא בכתב ערבי).

פורמטים אפשריים לכל שורה:
- תעתיק בלבד, בלי פירוש (למשל: "שוכרן")
- "תעתיק - פירוש" (מופרד במקף)
- "תעתיק = פירוש" (מופרד בסימן שווה)

הנחיות:
1. אסור בהחלט להחזיר טקסט בכתב ערבי בשום שדה. רק עברית (תעתיק ופירוש) מותרת.
2. עבור כל שורת קלט (לא ריקה לאחר טרימינג), החזר פריט פלט אחד, בדיוק לפי הסדר המקורי.
3. אם נתון פירוש בשורה, אמת שהוא סביר; אם הוא שגוי או לא הגיוני באופן בולט - אפשר לתקן אותו, אבל עדיף לשמור על כוונת המשתמש. אם לא נתון פירוש - הסק את הפירוש הסביר ביותר מהתעתיק.
4. סווג כל פריט כ-itemType:
   - WORD: מילה בודדת.
   - PHRASE: ביטוי מרובה מילים שאינו משפט שלם.
   - SENTENCE: משפט מלא או שאלה.
5. קבע needsReview=true עם reviewNote קצרה אם השורה מעורפלת, מבולבלת, לא נראית כתעתיק ערבי תקין, או ריקה אחרי טרימינג.
6. רמת המשתמש היא מתחילים - אל תניח הכרות עם דקדוק ערבי מורכב.`;

export function buildParseVocabUserMessage(rawText: string): string {
  return `נתח את שורות הטקסט הבאות (כל שורה היא פריט נפרד, שורות ריקות יש להתעלם מהן):\n\n${rawText}`;
}
