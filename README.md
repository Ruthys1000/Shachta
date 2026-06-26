# מתרגלת ערבית (Arabic Tutor)

אפליקציית Next.js לתרגול אישי של ערבית מדוברת בתעתיק עברי. אפליקציה למשתמש בודד (אין מערכת הרשמה/משתמשים — רק סיסמה גלובלית אחת), שמשתמשת ב-Claude (Anthropic) כדי לנתח שיעורים סרוקים מתמונות, ליצור מבדקים, ולעקוב אחר התקדמות בלמידת אוצר מילים.

## תוכן עניינים

- [מבנה ופיצ'רים](#מבנה-ופיצרים)
- [סטאק טכנולוגי](#סטאק-טכנולוגי)
- [הרצה מקומית](#הרצה-מקומית)
- [משתני סביבה](#משתני-סביבה)
- [Prisma / מסד נתונים](#prisma--מסד-נתונים)
- [פתרון תקלות בסביבת sandbox](#פתרון-תקלות-בסביבת-sandbox)
- [מבנה הקוד](#מבנה-הקוד)
- [סקריפטים](#סקריפטים)
- [קונבנציות עיצוב/קוד](#קונבנציות-עיצובקוד)

## מבנה ופיצ'רים

- **`/login`** — מסך כניסה עם סיסמה גלובלית (`APP_PASSWORD`). אין שם משתמש, אין הרשמה.
- **`/` (בית)** — תפריט ראשי עם 4 פעולות + כפתור התנתקות (עם דיאלוג אישור).
- **`/lesson` (סריקת שיעור)** — מעלים תמונות של עמודי שיעור → Claude Vision מנתח אותן (`/api/lesson/parse`) ומחזיר דיאלוג ואוצר מילים מזוהה → המשתמש עובר על הדיאלוג, מאשר/מתקן את אוצר המילים, שומר אותו, לומד אותו בפלאשקארדס, ולבסוף עושה מבדק שנוצר אוטומטית על הפריטים שנלמדו.
- **`/add-words` (הוספת מילים)** — הדבקת טקסט חופשי (מילים/ביטויים/משפטים) → Claude מנתח ומפרק (`/api/vocabulary/parse`) → אישור וטיפול בכפילויות מול אוצר המילים הקיים (`/api/vocabulary/bulk`, עם 3 אופציות לפריט כפול: השאר קיים / החלף בחדש / דלג).
- **`/vocabulary` (אוצר המילים שלי)** — רשימה עם חיפוש, סינון לפי סוג (מילה/ביטוי/משפט), עריכה ומחיקה של פריטים (`/api/vocabulary`, `/api/vocabulary/[id]`).
- **`/quiz` (מבדק חדש)** — Claude יוצר מבדק (`/api/quiz/generate`) על סמך אוצר המילים הקיים, עם דגש על פריטים שצריך לחזק (`needsReview`). תוצאות נשמרות ב-`PracticeHistory` (`/api/practice/batch`).

כל הממשק בעברית, RTL (`dir="rtl"` ב-`src/app/layout.tsx`), פונט Heebo.

## סטאק טכנולוגי

- **Next.js 16** (App Router, Turbopack) — ⚠️ גרסה חדשה עם breaking changes. לפני שינויים הקשורים ל-Next.js עצמו (routing, middleware, config), כדאי לבדוק את `node_modules/next/dist/docs/` (ראו `AGENTS.md`).
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** — טוקני עיצוב מוגדרים כמשתני CSS ב-`src/app/globals.css` (`--color-primary`, `--color-success`, `--color-danger`, `--color-muted`, כל אחד עם וריאנט `-soft`, ועוד `--color-card`, `--color-border`). **אין** ספריית קומפוננטות חיצונית (לא shadcn, לא MUI) — כל קומפוננטות ה-UI ב-`src/components/ui/` הן עצמאיות.
- **Prisma ORM 7** עם **driver adapter** (`@prisma/adapter-pg`, חיבור ישיר ל-Postgres דרך `pg` בלי query-engine בזמן ריצה — ראו `src/lib/prisma.ts`). מסד נתונים: PostgreSQL.
- **Anthropic SDK** (`@anthropic-ai/sdk`) — כל שיחה עם Claude עוברת דרך `src/lib/anthropic.ts` (`callClaudeForJSON` / `callClaudeVisionForJSON`), שמכריחות תשובה מסוג tool-use קשיח (JSON מובנה, לא טקסט חופשי). המודל המוגדר: `CLAUDE_MODEL` ב-`src/lib/constants.ts`.
- **lucide-react** לאייקונים, **clsx** ל-classNames מותנים, **zod** לוולידציה (`src/lib/validators.ts`).
- אימות: עוגיית session חתומה ב-HMAC (`src/lib/auth.ts`) שנבדקת ב-middleware (`src/proxy.ts` — שימו לב לשם הלא-סטנדרטי, זו ה"middleware" של Next.js הגרסה הזו).

## הרצה מקומית

```bash
npm install            # מריץ גם postinstall: prisma generate
cp .env.example .env   # ולמלא ערכים אמיתיים
npm run dev            # http://localhost:3000
```

דרישה: Postgres זמין בכתובת שמוגדרת ב-`DATABASE_URL` (ראו משתני סביבה). בלי זה, ה-build/dev יעלה אבל קריאות API שנוגעות במסד יחזירו שגיאת חיבור.

הרצה ראשונה על מסד חדש (אין כרגע migrations מבוצעות בריפו — תיקיית `prisma/migrations` קיימת אך ריקה):

```bash
npx prisma migrate dev --name init   # יוצר migration ראשוני + מריץ אותו
```

ב-production / build, ה-migrations מורצות אוטומטית: `npm run build` כולל `prisma migrate deploy`.

## משתני סביבה

מוגדרים ב-`.env` (ראו `.env.example` לתבנית):

| משתנה | תיאור | חובה |
|---|---|---|
| `DATABASE_URL` | מחרוזת חיבור ל-Postgres (`postgresql://user:pass@host:5432/db`) | כן, לכל פעולה שנוגעת במסד |
| `ANTHROPIC_API_KEY` | מפתח API של Anthropic, לכל קריאת Claude (ניתוח שיעור/מילים, יצירת מבדק) | כן, לפיצ'רים שמשתמשים ב-AI |
| `APP_PASSWORD` | הסיסמה הגלובלית היחידה לכניסה לאפליקציה | כן, ל-`/api/login` |
| `SESSION_SECRET` | מחרוזת אקראית ארוכה לחתימת HMAC על עוגיית ה-session | כן, לכל בקשה מאומתת |

אין משתמשים מרובים, אין OAuth — זה אפליקציית-יחיד עם סיסמה אחת.

## Prisma / מסד נתונים

- Schema: `prisma/schema.prisma`. שני מודלים: `Vocabulary` (פריט אוצר מילים — תעתיק ערבי, פירוש עברי, סוג `WORD`/`PHRASE`/`SENTENCE`) ו-`PracticeHistory` (סטטיסטיקת תרגול per-vocabulary: `correctCount`/`wrongCount`/`lastPracticed`).
- Config: `prisma.config.ts` — קורא `DATABASE_URL` מה-env (דרך `dotenv/config`).
- **חשוב:** הפרויקט משתמש ב-**driver adapter** (`PrismaPg`), כך שב-runtime **אין** תלות ב-query-engine בינארי — השאילתות עוברות ישירות דרך `pg`. ה-binary שכן נדרש בזמן `prisma generate`/`migrate` הוא רק **schema-engine** (לוולידציה/מיגרציות בזמן build/CLI, לא בזמן ריצה).
- `npm install` מריץ `postinstall: prisma generate` אוטומטית — צריך רשת תקינה להורדת ה-schema-engine בפעם הראשונה (ראו סעיף הבא אם זה נכשל).

## פתרון תקלות בסביבת sandbox

בסביבות agent/sandbox עם פרוקסי ארגוני (egress policy), `npm install`/`npx prisma generate` עלולים להיכשל. יש **שתי** תקלות אפשריות שונות, אל תתבלבלו ביניהן:

1. **`checkpoint.prisma.io` חסום (403)** — זו טלמטריה לא-קריטית של Prisma. פתרון: `CHECKPOINT_DISABLE=1` בסביבה (env var), עוצר את הקריאה הזו לפני שהיא קורית.
2. **הורדת בינארי ה-`schema-engine` נכשלת עם `ECONNRESET`** — לא חסימת מדיניות, אלא חיבור לא יציב באמצע הורדה סטרימינגית של ה-downloader הפנימי של Prisma דרך הפרוקסי (אומת: כתובת ה-URL עצמה נגישה ועובדת מצוין עם `curl`/`fetch` ישירים — רק ה-retry/agent הפנימי של Prisma נתקל ב-reset). פתרון חד-פעמי לסביבה:

```bash
# 1. למצוא את הגרסה/hash הנדרשים (מ-package-lock.json, חיפוש "@prisma/engines-version")
# 2. להוריד את הבינארי ישירות עם curl (קצר ועובד, בניגוד לדאונלודר הפנימי):
curl -sS -o /tmp/schema-engine.gz \
  "https://binaries.prisma.sh/all_commits/<ENGINES_HASH>/debian-openssl-3.0.x/schema-engine.gz"

# 3. לחלץ ולמקם בנתיב שPrisma מצפה לו, ולהפוך להרצה:
gunzip -c /tmp/schema-engine.gz > node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x
chmod +x node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x

# 4. להריץ generate רגיל — הוא ימצא שהקובץ קיים וידלג על ההורדה:
DATABASE_URL="postgresql://user:pass@localhost:5432/db" CHECKPOINT_DISABLE=1 npx prisma generate
```

לאחר זה, `node_modules/.prisma/client/` יכלול את כל קבצי ה-client, ו-`npx tsc --noEmit` צריך לרוץ נקי (0 שגיאות) — שגיאות כמו `"@prisma/client" has no exported member 'PrismaClient'/'ItemType'/...` הן הסימן לזה שהשלב הזה לא הושלם.

**הערה לכל סשן/branch חדש בסביבת sandbox:** התיקון הזה הוא state מקומי בתוך `node_modules` (לא ב-git, לא ב-commit). אם נפתח container/clone טרי, התקלה (#2) עלולה לחזור — חוזרים על הפקודות לעיל. אם זה אותו container ורק `git checkout` לענף אחר, **אין צורך לחזור על זה** — `node_modules` לא תלוי בענף.

ב-production / CI עם גישת רשת תקינה (לא sandbox), שום דבר מהסעיף הזה לא רלוונטי — `npm install`/`npm run build` עובדים כרגיל.

## מבנה הקוד

```
src/
  app/                    # Next.js App Router — כל תיקייה = מסך/route
    api/                  # API routes (route handlers)
    lesson/, add-words/, vocabulary/, quiz/, login/   # מסכים
    layout.tsx            # root layout: html dir="rtl", ToastProvider
    page.tsx               # מסך הבית
  components/
    ui/                   # קומפוננטות UI גנריות (Button, Card, Modal, Toast, ConfirmDialog...)
    lesson/, add-words/, vocabulary/, quiz/, home/   # קומפוננטות ספציפיות-למסך
  lib/
    prisma.ts             # PrismaClient singleton + driver adapter
    auth.ts                # session token (HMAC) + בדיקת סיסמה
    anthropic.ts            # wrapper לקריאות Claude (tool-use מובנה)
    ai/                     # system prompts ל-Claude (ניתוח שיעור/מילים/מבדק)
    validators.ts            # zod schemas
    normalize.ts, levenshtein.ts   # התאמת תשובות חופשיות במבדק
    image.ts                  # דחיסת תמונות בצד הלקוח לפני העלאה
    apiFetch.ts                 # wrapper ל-fetch שמבדיל שגיאת רשת משגיאת שרת
    constants.ts
  types/index.ts            # טיפוסים משותפים (ParsedVocabItem, Quiz, וכו')
  proxy.ts                    # "middleware" — אכיפת אימות לכל route חוץ מ-login
prisma/schema.prisma           # מודל המסד
```

## סקריפטים

```bash
npm run dev      # שרת dev עם Turbopack
npm run build    # prisma migrate deploy && next build
npm run start    # שרת production (אחרי build)
npm run lint     # eslint
npx tsc --noEmit # type-check בלי build
```

## קונבנציות עיצוב/קוד

- **אין** הוספת ספריות UI/state-management חדשות בלי צורך אמיתי — יש קומפוננטות גנריות מוכנות ב-`src/components/ui/` (`Card` עם tones: default/success/danger/muted, `Button` עם `loading`/`variant`, `Modal`, `Spinner`, `EmptyState`, `Toast`/`useToast`, `ConfirmDialog`).
- כל הטקסט במוצר בעברית, RTL. שגיאות API מוחזרות כ-`{ error: "<הודעה בעברית>" }`.
- שינויים שנוגעים ב-Next.js עצמו (routing, config, middleware) — לבדוק קודם `node_modules/next/dist/docs/`, כי זו גרסה עם שינויים לא-סטנדרטיים (ראו `AGENTS.md`).
- התראות למשתמש (toast) דרך `useToast()` מ-`@/components/ui/Toast` — לא להמציא מנגנון נפרד.
- קריאות `fetch` מהלקוח שצריכות להבדיל בין שגיאת רשת לשגיאת שרת — להשתמש ב-`apiFetch` מ-`@/lib/apiFetch` במקום `fetch` גולמי.
