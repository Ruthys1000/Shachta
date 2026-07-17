-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "placement_level" INTEGER,
    "placement_score" INTEGER,
    "placement_total" INTEGER,
    "placement_taken_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
