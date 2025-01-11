/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId]` on the table `Context` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Context_workspaceId_key" ON "Context"("workspaceId");
