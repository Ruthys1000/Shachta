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
}

export interface Story {
  title: string;
  segments: StorySegment[];
  questions: StoryQuestion[];
}
