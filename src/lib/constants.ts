export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Read-only demo login: a fixed code that grants a short-lived, view-only session.
// The session shows the real account but every write is blocked (see src/lib/session.ts).
export const DEMO_LOGIN_CODE = "orly-demo";
export const DEMO_SESSION_MAX_AGE_SECONDS = 60 * 60 * 48; // 48 hours

export const CLAUDE_MODEL = "claude-sonnet-4-6";

// Daily spending cap for Anthropic API usage. Override via env if needed.
export const AI_DAILY_BUDGET_USD = process.env.AI_DAILY_BUDGET_USD
  ? Number(process.env.AI_DAILY_BUDGET_USD)
  : 5;
// Stricter daily cap applied to the read-only demo session, tracked separately from
// the owner's spend so demo generation can't burn the real budget.
export const AI_DEMO_DAILY_BUDGET_USD = process.env.AI_DEMO_DAILY_BUDGET_USD
  ? Number(process.env.AI_DEMO_DAILY_BUDGET_USD)
  : 1;
// Claude Sonnet pricing per million tokens (verify against current Anthropic pricing).
export const CLAUDE_INPUT_PRICE_PER_MTOK_USD = 3;
export const CLAUDE_OUTPUT_PRICE_PER_MTOK_USD = 15;

export const QUIZ_MIN_QUESTIONS = 3;
export const QUIZ_MAX_QUESTIONS = 10;
export const QUIZ_MULTIPLE_CHOICE_MIN_VOCAB = 4;
// Size of the candidate word pool sampled (weighted by practice history) before
// asking Claude to build a quiz, so questions rotate and skew toward weak words.
export const QUIZ_CANDIDATE_POOL_SIZE = 15;

export const WRITING_SESSION_SIZE = 10;

export const STORY_MIN_VOCAB = 5;
export const STORY_MIN_SEGMENTS = 4;
export const STORY_MAX_SEGMENTS = 7;
export const STORY_MIN_QUESTIONS = 3;
export const STORY_MAX_QUESTIONS = 6;
// Size of the candidate word pool sampled (weighted by practice history) before
// asking Claude to write a story, so the vocabulary mix - and with it the topic -
// rotates instead of always drawing from the same growing full list.
export const STORY_CANDIDATE_POOL_SIZE = 12;
// How many recent story themes to show the AI so it avoids repeating the same topic.
export const STORY_RECENT_THEMES_LIMIT = 15;

export const SENTENCE_LESSON_MIN_VOCAB = 6;
export const SENTENCE_LESSON_MIN_EXAMPLES = 2;
export const SENTENCE_LESSON_MAX_EXAMPLES = 4;
export const SENTENCE_LESSON_MIN_EXERCISES = 3;
export const SENTENCE_LESSON_MAX_EXERCISES = 5;

// Lessons completed needed to advance one sentence-builder level.
export const SENTENCE_LESSON_LEVEL_STEP = 3;
export const SENTENCE_LESSON_MAX_LEVEL = 4;

// Gamification: XP awarded per unit of existing activity (no new tables — derived
// from Vocabulary/PracticeHistory/SentenceLessonHistory counts).
export const XP_PER_VOCAB_ITEM = 5;
export const XP_PER_CORRECT_ANSWER = 2;
export const XP_PER_WRONG_ANSWER = 1;
export const XP_PER_SENTENCE_LESSON = 15;
export const XP_PER_STORY_COMPLETED = 15;
// Cumulative XP required for level n = LEVEL_XP_BASE * (n-1) * n.
export const LEVEL_XP_BASE = 40;
// Daily practice goal per UTC day: distinct quiz/writing words
// (PracticeHistory.lastPracticed) plus story questions (StoryHistory) and
// sentence-builder exercises (SentenceLessonHistory) answered today.
export const DAILY_GOAL_TARGET = 15;
// How many recently-taught rule titles to show the AI so it avoids repeating them.
export const SENTENCE_LESSON_RECENT_TITLES_LIMIT = 15;
