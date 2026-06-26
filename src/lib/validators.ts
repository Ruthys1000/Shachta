import { z } from "zod";

export const itemTypeSchema = z.enum(["WORD", "PHRASE", "SENTENCE"]);

export const createVocabularySchema = z.object({
  arabicTranslit: z.string().trim().min(1).max(500),
  hebrewMeaning: z.string().trim().min(1).max(500),
  itemType: itemTypeSchema,
});

export const updateVocabularySchema = createVocabularySchema.partial();

export const parseVocabRequestSchema = z.object({
  text: z.string().trim().min(1).max(10_000),
});

export const bulkVocabItemSchema = z.object({
  tempId: z.string(),
  arabicTranslit: z.string().trim().min(1).max(500),
  hebrewMeaning: z.string().trim().min(1).max(500),
  itemType: itemTypeSchema,
  resolution: z.enum(["keep", "replace", "skip"]).nullable(),
});

export const bulkVocabRequestSchema = z.object({
  items: z.array(bulkVocabItemSchema).min(1),
});

export const practiceBatchRequestSchema = z.object({
  results: z
    .array(
      z.object({
        vocabularyId: z.string().uuid(),
        correct: z.boolean(),
      })
    )
    .min(1),
});

export const quizGenerateRequestSchema = z.object({
  questionCount: z.number().int().min(1).max(20).optional(),
  vocabularyIds: z.array(z.string().uuid()).min(1).optional(),
});

export const lessonImageSchema = z.object({
  data: z.string().min(1),
  mediaType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
});

export const lessonParseRequestSchema = z.object({
  images: z.array(lessonImageSchema).min(1).max(10),
});

export const dialogueLineSchema = z.object({
  speaker: z.string().optional(),
  arabicTranslit: z.string(),
  hebrewMeaning: z.string(),
});

export const aiParsedItemSchema = z.object({
  arabicTranslit: z.string(),
  hebrewMeaning: z.string(),
  itemType: itemTypeSchema,
  needsReview: z.boolean(),
  reviewNote: z.string().optional(),
});

export const aiParseResponseSchema = z.object({
  items: z.array(aiParsedItemSchema),
});

export const aiLessonParseResponseSchema = z.object({
  lessonTitle: z.string().optional(),
  vocabulary: z.array(aiParsedItemSchema),
  dialogue: z.array(dialogueLineSchema),
});

export const aiQuizQuestionSchema = z.object({
  type: z.enum([
    "translation_ar_he",
    "translation_he_ar",
    "fill_in_blank",
    "multiple_choice",
    "meaning_id",
    "scenario",
  ]),
  question: z.string(),
  correctAnswer: z.string(),
  options: z.array(z.string()).optional(),
  sourceVocabId: z.string(),
});

export const aiQuizResponseSchema = z.object({
  title: z.string(),
  questions: z.array(aiQuizQuestionSchema),
});
