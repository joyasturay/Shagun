-- DropForeignKey
ALTER TABLE "Subevents" DROP CONSTRAINT "Subevents_eventId_fkey";

-- AddForeignKey
ALTER TABLE "Subevents" ADD CONSTRAINT "Subevents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
