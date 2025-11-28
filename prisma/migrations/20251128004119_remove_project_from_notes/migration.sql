/*
  Warnings:

  - You are about to drop the column `projectID` on the `Note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_projectID_fkey";

-- DropIndex
DROP INDEX "Note_projectID_idx";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "projectID";
