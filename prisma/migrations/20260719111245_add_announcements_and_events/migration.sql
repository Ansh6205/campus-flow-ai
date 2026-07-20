/*
  Warnings:

  - Made the column `college` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `department` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `division` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rollNumber` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "college" SET NOT NULL,
ALTER COLUMN "department" SET NOT NULL,
ALTER COLUMN "year" SET NOT NULL,
ALTER COLUMN "division" SET NOT NULL,
ALTER COLUMN "rollNumber" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
