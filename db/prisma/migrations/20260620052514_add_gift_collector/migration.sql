-- AlterTable
ALTER TABLE "Gift" ADD COLUMN     "collectedById" TEXT;

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
