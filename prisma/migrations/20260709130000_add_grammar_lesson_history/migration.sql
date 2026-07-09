-- CreateTable
CREATE TABLE "grammar_lesson_history" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grammar_lesson_history_pkey" PRIMARY KEY ("id")
);
