import { prisma } from "@/lib/prisma";
import {
  DAILY_GOAL_TARGET,
  LEVEL_XP_BASE,
  XP_PER_CORRECT_ANSWER,
  XP_PER_SENTENCE_LESSON,
  XP_PER_STORY_COMPLETED,
  XP_PER_VOCAB_ITEM,
  XP_PER_WRONG_ANSWER,
} from "@/lib/constants";
import { evaluateAchievements, type AchievementResult } from "@/lib/achievements";

export interface GamificationStats {
  vocabularyCount: number;
  phraseCount: number;
  sentenceCount: number;
  totalCorrect: number;
  totalWrong: number;
  lessonsCompleted: number;
  sentenceExerciseCorrect: number;
  sentenceExerciseWrong: number;
  storiesCompleted: number;
  storyQuestionCorrect: number;
  storyQuestionWrong: number;
  practicedToday: number;
  storyQuestionsToday: number;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percent: number;
}

export interface GamificationSummary {
  xp: number;
  level: number;
  levelProgress: LevelProgress;
  dailyGoal: { current: number; target: number };
  achievements: AchievementResult[];
  vocabularyCount: number;
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function getGamificationStats(): Promise<GamificationStats> {
  const [byType, historySums, sentenceSums, storyAggregate, practicedToday, storyTodayAgg] =
    await Promise.all([
      prisma.vocabulary.groupBy({ by: ["itemType"], _count: true }),
      prisma.practiceHistory.aggregate({
        _sum: { correctCount: true, wrongCount: true },
      }),
      prisma.sentenceLessonHistory.aggregate({
        _count: true,
        _sum: { correctCount: true, wrongCount: true },
      }),
      prisma.storyHistory.aggregate({
        _count: true,
        _sum: { correctCount: true, wrongCount: true },
      }),
      prisma.practiceHistory.count({
        where: { lastPracticed: { gte: startOfTodayUtc() } },
      }),
      prisma.storyHistory.aggregate({
        _sum: { correctCount: true, wrongCount: true },
        where: { createdAt: { gte: startOfTodayUtc() } },
      }),
    ]);

  const storyQuestionsToday =
    (storyTodayAgg._sum.correctCount ?? 0) + (storyTodayAgg._sum.wrongCount ?? 0);

  const phraseCount = byType.find((g) => g.itemType === "PHRASE")?._count ?? 0;
  const sentenceCount = byType.find((g) => g.itemType === "SENTENCE")?._count ?? 0;
  const vocabularyCount = byType.reduce((sum, g) => sum + g._count, 0);

  return {
    vocabularyCount,
    phraseCount,
    sentenceCount,
    totalCorrect: historySums._sum.correctCount ?? 0,
    totalWrong: historySums._sum.wrongCount ?? 0,
    lessonsCompleted: sentenceSums._count,
    sentenceExerciseCorrect: sentenceSums._sum.correctCount ?? 0,
    sentenceExerciseWrong: sentenceSums._sum.wrongCount ?? 0,
    storiesCompleted: storyAggregate._count,
    storyQuestionCorrect: storyAggregate._sum.correctCount ?? 0,
    storyQuestionWrong: storyAggregate._sum.wrongCount ?? 0,
    practicedToday,
    storyQuestionsToday,
  };
}

export function computeXp(stats: GamificationStats): number {
  return (
    stats.vocabularyCount * XP_PER_VOCAB_ITEM +
    stats.totalCorrect * XP_PER_CORRECT_ANSWER +
    stats.totalWrong * XP_PER_WRONG_ANSWER +
    stats.lessonsCompleted * XP_PER_SENTENCE_LESSON +
    stats.sentenceExerciseCorrect * XP_PER_CORRECT_ANSWER +
    stats.sentenceExerciseWrong * XP_PER_WRONG_ANSWER +
    stats.storiesCompleted * XP_PER_STORY_COMPLETED +
    stats.storyQuestionCorrect * XP_PER_CORRECT_ANSWER +
    stats.storyQuestionWrong * XP_PER_WRONG_ANSWER
  );
}

export function xpThresholdForLevel(level: number): number {
  return LEVEL_XP_BASE * (level - 1) * level;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpThresholdForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const xpIntoLevel = xp - xpThresholdForLevel(level);
  const xpForNextLevel = xpThresholdForLevel(level + 1) - xpThresholdForLevel(level);
  const percent = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));
  return { level, xpIntoLevel, xpForNextLevel, percent };
}

export async function getGamificationSummary(): Promise<GamificationSummary> {
  const stats = await getGamificationStats();
  const xp = computeXp(stats);

  return {
    xp,
    level: levelForXp(xp),
    levelProgress: levelProgress(xp),
    dailyGoal: {
      // Quiz words practiced today + story questions answered today.
      current: stats.practicedToday + stats.storyQuestionsToday,
      target: DAILY_GOAL_TARGET,
    },
    achievements: evaluateAchievements(stats),
    vocabularyCount: stats.vocabularyCount,
  };
}
