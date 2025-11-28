-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "projectID" TEXT;

-- CreateIndex
CREATE INDEX "Note_projectID_idx" ON "Note"("projectID");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
