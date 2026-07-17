import type { ItemType, Vocabulary, PracticeHistory } from "@prisma/client";

export type { ItemType };

export type VocabularyWithHistory = Vocabulary & {
  practiceHistory: PracticeHistory | null;
};

export interface ParsedVocabItem {
  tempId: string;
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: ItemType;
  needsReview: boolean;
  reviewNote?: string;
}

export type DuplicateResolution = "keep" | "replace" | "skip";

export interface BulkVocabItem {
  tempId: string;
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: ItemType;
  resolution: DuplicateResolution | null;
}

export interface BulkVocabConflict {
  tempId: string;
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: ItemType;
  existing: Vocabulary;
}

export type QuizQuestionType =
  | "translation_ar_he"
  | "translation_he_ar"
  | "fill_in_blank"
  | "multiple_choice"
  | "meaning_id"
  | "scenario";

export interface QuizQuestion {
  type: QuizQuestionType;
  question: string;
  correctAnswer: string;
  options?: string[];
  sourceVocabId: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface PracticeResult {
  vocabularyId: string;
  correct: boolean;
}

export interface WritingPrompt {
  vocabularyId: string;
  hebrewMeaning: string;
  itemType: ItemType;
  correctAnswer: string;
}

export interface WritingSession {
  items: WritingPrompt[];
}

export interface DialogueLine {
  speaker?: string;
  arabicTranslit: string;
  hebrewMeaning: string;
}

export interface LessonParseResponse {
  lessonTitle?: string;
  vocabulary: ParsedVocabItem[];
  dialogue: DialogueLine[];
}

export interface StorySegment {
  arabicTranslit: string;
  hebrewMeaning: string;
}

export interface StoryQuestion {
  question: string;
  questionHebrew: string;
  correctAnswer: string;
  options: string[];
}

export interface Story {
  title: string;
  theme: string;
  segments: StorySegment[];
  questions: StoryQuestion[];
}

export interface SentenceLessonWord {
  arabicTranslit: string;
  hebrewMeaning: string;
  role: string;
}

export interface SentenceLessonExample {
  arabicTranslit: string;
  hebrewMeaning: string;
  words: SentenceLessonWord[];
}

export interface SentenceBuildExercise {
  hebrewMeaning: string;
  correctOrder: string[];
}

export interface SentenceLesson {
  title: string;
  ruleExplanation: string;
  examples: SentenceLessonExample[];
  exercises: SentenceBuildExercise[];
}

export interface GrammarConjugationExample {
  pronoun: string;
  arabicTranslit: string;
  hebrewMeaning: string;
}

export interface GrammarExercise {
  promptHebrew: string;
  correctAnswer: string;
  options: string[];
}

export interface GrammarLesson {
  title: string;
  ruleExplanation: string;
  tense: string;
  pronouns: string[];
  focus: string;
  conjugationExamples: GrammarConjugationExample[];
  exercises: GrammarExercise[];
}

export interface PlacementQuestion {
  /** Difficulty band this question probes, 1..4. */
  level: number;
  /** The prompt (Hebrew, or Hebrew-script transliteration with a Hebrew gloss). */
  question: string;
  correctAnswer: string;
  options: string[];
}

export interface PlacementTest {
  title: string;
  questions: PlacementQuestion[];
}
