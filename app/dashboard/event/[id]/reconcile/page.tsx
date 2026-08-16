import prisma from "@/db/lib/prisma"
import {auth} from "app/lib/auth"
import { notFound, redirect } from "next/navigation"
import ReconTable from "@/components/ui/ReconTable"
import ExportButton from "@/components/ui/ExportButton"
import { DashboardShell } from "@/components/ui/dashboard-shell"

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReconcilePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const { id } = await params

  const event = await prisma.events.findUnique({
    where: { id: id },
    select: { name: true, userId: true } 
  })

  if (!event) return notFound()
  
  if (event.userId !== session.user.id) {
    redirect(`/dashboard/event/${id}`)
  }
  const rawGifts = await prisma.gift.findMany({
    where: { batch: { event: { eventId: id } } },
    include: {
      collectedBy: { select: { name: true, email: true } },
      batch: {
        select: {
          bagNumber: true,
          event: { select: { name: true } },
          user: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const gifts = rawGifts.map((g) => ({
    id: g.id,
    amount: g.amount,
    sender: g.sender,
    status: g.status,
    imageUrl: g.imageUrl,
    bagNumber: g.batch.bagNumber,
    collectedBy:
      g.collectedBy?.name ||
      g.collectedBy?.email ||
      g.batch.user?.name ||
      g.batch.user?.email ||
      "Unknown",
  }))

  return (
    <DashboardShell
      title="Audit & Reconciliation"
      subtitle="Verify physical cash and track missing envelopes."
      backHref={`/dashboard/event/${id}`}
      backLabel={`Back to ${event.name}`}
      action={<ExportButton eventId={id} />}
    >
      {gifts.length > 0 ? (
        <ReconTable gifts={gifts} eventId={id} />
      ) : (
        <div className="rounded-2xl bg-warm-stone py-24 text-center">
          <p className="text-[length:var(--text-caption)] italic text-pewter">
            No envelopes collected yet.
          </p>
        </div>
      )}
    </DashboardShell>
  )
}
