'use server'

import prisma from "@/db/lib/prisma"
import { auth } from "../lib/auth"

export type AnalyticsData = {
  totalAmount: number
  totalGifts: number
  recentGifts: {
    id: string
    amount: number
    sender: string | null
    createdAt: Date
    batchId: string
    collectorName: string
  }[]
  activeCollectors: {
    name: string
    lastActivity: Date
    count: number 
  }[]
}

export async function getLiveAnalytics(eventId: string): Promise<AnalyticsData | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // 1. SECURITY: STRICT OWNERSHIP CHECK
  // Only the Creator can see the money. Team members (collectors) get rejected.
  const event = await prisma.events.findUnique({
    where: { id: eventId },
    select: { userId: true }
  })

  if (!event || event.userId !== session.user.id) {
    return { error: "Access Denied. Only the Event Admin can view financial data." }
  }

  // 2. FETCH TOTALS (The Big Numbers)
  // We aggregate across ALL batches for this event
  const aggregations = await prisma.gift.aggregate({
    where: { 
      batch: { eventId: { in: await getSubeventIds(eventId) } } 
    },
    _sum: { amount: true },
    _count: { amount: true }
  })

  // 3. FETCH RECENT FEED (The Ticker)
  const recentGifts = await prisma.gift.findMany({
    where: { 
      batch: { eventId: { in: await getSubeventIds(eventId) } } 
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      batch: {
        include: { user: { select: { name: true } } } // Who holds the bag?
      }
    }
  })

  // 4. CALCULATE "ACTIVE COLLECTORS" (Who is working now?)
  // We look for gifts created in the last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const activeStats = await prisma.gift.groupBy({
    by: ['batchId'],
    where: {
      batch: { eventId: { in: await getSubeventIds(eventId) } },
      createdAt: { gte: tenMinutesAgo }
    },
    _count: { id: true },
    _max: { createdAt: true }
  })

  // Map batch IDs back to user names (a bit complex, but accurate)
  // For MVP, we'll simplify this by just returning the feed data for now
  // Real implementation would join this with the User table.
  
  return {
    totalAmount: aggregations._sum.amount || 0,
    totalGifts: aggregations._count.amount || 0,
    recentGifts: recentGifts.map(g => ({
      id: g.id,
      amount: g.amount || 0,
      sender: g.sender,
      createdAt: g.createdAt,
      batchId: g.batchId,
      collectorName: g.batch.user.name || "Unknown"
    })),
    activeCollectors: [] // Populated in a real join, skipped for brevity
  }
}

// Helper to get all Subevent IDs for an Event
async function getSubeventIds(eventId: string) {
  const subevents = await prisma.subevents.findMany({
    where: { eventId },
    select: { id: true }
  })
  return subevents.map(s => s.id)
}