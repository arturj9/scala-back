/*
  Warnings:

  - You are about to drop the column `target_type` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `target_value` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the `HabitCompletion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `goal_type` to the `Habit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal_value` to the `Habit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HabitGoalType" AS ENUM ('TIMES_PER_DAY', 'MINUTES_PER_DAY');

-- DropForeignKey
ALTER TABLE "HabitCompletion" DROP CONSTRAINT "HabitCompletion_habit_id_fkey";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "target_type",
DROP COLUMN "target_value",
ADD COLUMN     "days_of_week" SMALLINT[],
ADD COLUMN     "goal_type" "HabitGoalType" NOT NULL,
ADD COLUMN     "goal_value" INTEGER NOT NULL;

-- DropTable
DROP TABLE "HabitCompletion";

-- DropEnum
DROP TYPE "HabitType";

-- CreateTable
CREATE TABLE "HabitCheckIn" (
    "id" TEXT NOT NULL,
    "checkin_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "habit_id" TEXT NOT NULL,

    CONSTRAINT "HabitCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HabitCheckIn_habit_id_checkin_timestamp_idx" ON "HabitCheckIn"("habit_id", "checkin_timestamp");

-- AddForeignKey
ALTER TABLE "HabitCheckIn" ADD CONSTRAINT "HabitCheckIn_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
