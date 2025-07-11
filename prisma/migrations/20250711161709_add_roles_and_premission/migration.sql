/*
  Warnings:

  - You are about to drop the `UserRoles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'AGENT', 'COMPANY_ADMIN', 'COMPANY_USER', 'DEVELOPER', 'ADMINISTRATOR', 'MANAGER', 'STAFF', 'CLIENT');

-- DropForeignKey
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_userId_fkey";

-- DropTable
DROP TABLE "UserRoles";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" "RoleType" NOT NULL,
    "permission" TEXT[],

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
