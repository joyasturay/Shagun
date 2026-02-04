-- CreateTable
CREATE TABLE "_EventTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventTeam_B_index" ON "_EventTeam"("B");

-- AddForeignKey
ALTER TABLE "_EventTeam" ADD CONSTRAINT "_EventTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventTeam" ADD CONSTRAINT "_EventTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
