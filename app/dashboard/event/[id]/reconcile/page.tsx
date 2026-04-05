import prisma from "@/db/lib/prisma"
import {auth} from "app/lib/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import ReconTable from "@/components/ui/ReconTable"
import ExportButton from "@/components/ui/ExportButton"

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
  const gifts = await prisma.gift.findMany({
    where: { batch: { event: { eventId: id } } },
    include: {
      batch: {
        select: {
          bagNumber: true,
          event: { select: { name: true } }, 
          user: { select: { name: true } }   
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div>
        <Link 
          href={`/dashboard/event/${id}`} 
          className="text-sm font-medium text-gray-500 hover:text-black mb-4 inline-block transition"
        >
          ← Back to {event.name}
        </Link>
        
        <div className="flex justify-between items-end border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold">Audit & Reconciliation</h1>
            <p className="text-gray-500 mt-1">Verify physical cash and track missing envelopes.</p>
          </div>
          
          {/* Moved the Export Button here! */}
          <ExportButton eventId={id} />
        </div>
      </div>

      {/* RECONCILIATION TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {gifts.length > 0 ? (
          <ReconTable gifts={gifts} eventId={id} />
        ) : (
          <div className="p-16 text-center text-gray-400 italic bg-gray-50">
            No envelopes collected yet.
          </div>
        )}
      </div>

    </div>
  )
}