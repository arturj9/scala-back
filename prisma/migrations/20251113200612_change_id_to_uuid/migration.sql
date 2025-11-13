/*
  Warnings:

  - The primary key for the `Habit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HabitCompletion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HabitTimeEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_user_id_fkey";

-- DropForeignKey
ALTER TABLE "HabitCompletion" DROP CONSTRAINT "HabitCompletion_habit_id_fkey";

-- DropForeignKey
ALTER TABLE "HabitTimeEntry" DROP CONSTRAINT "HabitTimeEntry_habit_id_fkey";

-- AlterTable
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Habit_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Habit_id_seq";

-- AlterTable
ALTER TABLE "HabitCompletion" DROP CONSTRAINT "HabitCompletion_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "habit_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HabitCompletion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "HabitCompletion_id_seq";

-- AlterTable
ALTER TABLE "HabitTimeEntry" DROP CONSTRAINT "HabitTimeEntry_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "habit_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HabitTimeEntry_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "HabitTimeEntry_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitCompletion" ADD CONSTRAINT "HabitCompletion_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitTimeEntry" ADD CONSTRAINT "HabitTimeEntry_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
