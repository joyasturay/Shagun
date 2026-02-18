'use server'

import prisma from "@/db/lib/prisma"
import { auth } from "../lib/auth"

export type BatchStat = {
  batchId: string
  bagNumber: number
  collectorName: string
  totalAmount: number
  giftCount: number
  lastActive: Date | null
  isActive: boolean // True if scanned in last 15 mins
}

export type AnalyticsData = {
  totalAmount: number
  totalGifts: number
  recentGifts: {
    id: string
    amount: number
    sender: string | null
    createdAt: Date
    collectorName: string
  }[]
  batchStats: BatchStat[] // <--- NEW FIELD
}

export async function getLiveAnalytics(eventId: string): Promise<AnalyticsData | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // 1. Security Check
  const event = await prisma.events.findUnique({
    where: { id: eventId },
    select: { userId: true }
  })

  if (!event || event.userId !== session.user.id) {
    return { error: "Access Denied" }
  }

  // 2. Get All Batches for this Event (Hierarchy: Event -> Subevents -> Batches)
  // We need to fetch the Batch details AND the User (Collector) details
  const batches = await prisma.batch.findMany({
    where: {
      event: { eventId: eventId }
    },
    include: {
      user: { select: { name: true } } // The Collector
    }
  })

  // 3. Aggregate Gifts per Batch (The Money Logic)
  // We group by batchId to get sums and latest timestamps
  const giftStats = await prisma.gift.groupBy({
    by: ["batchId"],
    where: {
      batch:{event:{eventId:eventId}}
    },
    _sum: { amount: true },
    _count: { id: true },
    _max:{createdAt:true}
  })

  // 4. Merge Data (Combine Batch Info with Gift Stats)
  const batchStats: BatchStat[] = batches.map(batch => {
    const stats = giftStats.find(s => s.batchId === batch.id)
    const amount = stats?._sum.amount || 0
    const count = stats?._count.id || 0
    const lastActive = stats?._max.createdAt || null

    // "Active" logic: If last gift was within 15 minutes
    const fifteenMinsAgo = Date.now() - (15 * 60 * 1000)
    const isActive = lastActive ? lastActive.getTime() > fifteenMinsAgo : false

    return {
      batchId: batch.id,
      bagNumber: batch.bagNumber,
      collectorName: batch.user.name || "Unknown",
      totalAmount: amount,
      giftCount: count,
      lastActive,
      isActive
    }
  })

  // Sort: Active collectors first, then by total money
  batchStats.sort((a, b) => (b.isActive === a.isActive ? 0 : b.isActive ? 1 : -1) || b.totalAmount - a.totalAmount)

  // 5. Calculate Grand Totals
  const totalAmount = batchStats.reduce((sum, b) => sum + b.totalAmount, 0)
  const totalGifts = batchStats.reduce((sum, b) => sum + b.giftCount, 0)

  // 6. Get Recent Feed
  const recentGifts = await prisma.gift.findMany({
    where: { batch: { event: { eventId: eventId } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { batch: { include: { user: true } } }
  })

  return {
    totalAmount,
    totalGifts,
    batchStats,
    recentGifts: recentGifts.map(g => ({
      id: g.id,
      amount: g.amount || 0,
      sender: g.sender,
      createdAt: g.createdAt,
      collectorName: g.batch.user.name || "Unknown"
    }))
  }
}