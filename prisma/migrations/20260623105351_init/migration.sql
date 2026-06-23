-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WORD', 'PHRASE', 'SENTENCE');

-- CreateTable
CREATE TABLE "vocabulary" (
    "id" TEXT NOT NULL,
    "arabic_translit" TEXT NOT NULL,
    "hebrew_meaning" TEXT NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_history" (
    "id" TEXT NOT NULL,
    "vocabulary_id" TEXT NOT NULL,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "last_practiced" TIMESTAMP(3),

    CONSTRAINT "practice_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_arabic_translit_key" ON "vocabulary"("arabic_translit");

-- CreateIndex
CREATE UNIQUE INDEX "practice_history_vocabulary_id_key" ON "practice_history"("vocabulary_id");

-- AddForeignKey
ALTER TABLE "practice_history" ADD CONSTRAINT "practice_history_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
