-- CreateTable
CREATE TABLE "sentence_lesson_history" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentence_lesson_history_pkey" PRIMARY KEY ("id")
);
