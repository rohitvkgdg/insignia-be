/*
  Warnings:

  - You are about to alter the column `event_id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `VarChar(10)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "event_id" SET DATA TYPE VARCHAR(10);
