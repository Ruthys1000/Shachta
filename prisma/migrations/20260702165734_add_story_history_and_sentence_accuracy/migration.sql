-- AlterTable
ALTER TABLE "sentence_lesson_history" ADD COLUMN     "correct_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wrong_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "story_history" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_history_pkey" PRIMARY KEY ("id")
);
