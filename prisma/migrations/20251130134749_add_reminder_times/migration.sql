-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "reminder_times" TEXT[] DEFAULT ARRAY[]::TEXT[];
