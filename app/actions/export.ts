'use server'

import prisma from "@/db/lib/prisma"
import { auth } from "../lib/auth"

export async function exportEventData(eventId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const gifts = await prisma.gift.findMany({
    where: { batch: { event: { eventId: eventId } } },
    include: { batch: { include: { user: { select: { name: true } }, event: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' }
  })

  const headers = ["Date", "Ceremony", "Bag Number", "Collector", "Sender", "Amount", "Status", "Note"]
  const rows = gifts.map(g => [
    g.createdAt.toISOString().split('T')[0],
    g.batch.event.name,
    g.batch.bagNumber,
    g.batch.user.name,
    `"${g.sender || 'Anonymous'}"`,
    g.amount,
    g.status,
    `"${g.note || ''}"`
  ])

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
  return { csv: csvContent, filename: `wedding-gifts-${eventId}.csv` }
}