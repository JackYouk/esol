-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_classroomId_fkey";

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "classroomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
