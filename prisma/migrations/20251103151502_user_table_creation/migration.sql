-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Student', 'Teacher', 'Principal', 'HOD', 'Admin');

-- CreateEnum
CREATE TYPE "Session" AS ENUM ('Morning', 'Evening');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "dept" TEXT,
    "session" "Session",
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL,
    "batch" TEXT,
    "designation" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
