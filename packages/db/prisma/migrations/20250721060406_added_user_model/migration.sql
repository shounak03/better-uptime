/*
  Warnings:

  - Added the required column `userId` to the `website` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "timeAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Insert a default user for existing website records
INSERT INTO "User" ("id", "name", "email", "password") VALUES ('default-user-id', 'Default User', 'default@example.com', 'temporary-password');

-- AlterTable - Add userId column with default value
ALTER TABLE "website" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'default-user-id';

-- Remove the default constraint now that all rows have values
ALTER TABLE "website" ALTER COLUMN "userId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
