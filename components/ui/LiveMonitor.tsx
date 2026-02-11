'use client'

import { getLiveAnalytics, type AnalyticsData } from "@/app/actions/analytics"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LiveMonitor({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // THE POLLING ENGINE
  useEffect(() => {
    // 1. Define the fetch function
    const fetchData = async () => {
      const result = await getLiveAnalytics(eventId)
      if ('error' in result) {
        setError(result.error)
      } else {
        setData(result)
        setLastUpdated(new Date())
      }
      setLoading(false)
    }

    // 2. Run immediately
    fetchData()

    // 3. Set interval (Every 5 seconds)
    const interval = setInterval(fetchData, 5000)

    // 4. Cleanup on unmount
    return () => clearInterval(interval)
  }, [eventId])

  if (error) return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
      🔒 {error}
    </div>
  )

  if (loading && !data) return (
    <div className="animate-pulse p-8 space-y-4">
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-64 bg-gray-200 rounded-xl"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header / Status */}
      <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
        <span>🔴 LIVE FEED</span>
        <span>Last Updated: {lastUpdated.toLocaleTimeString()}</span>
      </div>

      {/* BIG NUMBERS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TOTAL CASH */}
        <div className="bg-black text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between h-40">
          <span className="text-sm font-medium opacity-70">TOTAL COLLECTED</span>
          <div className="text-5xl font-bold tracking-tight">
            ₹ {data?.totalAmount.toLocaleString()}
          </div>
        </div>

        {/* TOTAL ENVELOPES */}
        <div className="bg-white border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40">
           <span className="text-sm font-medium text-gray-500">TOTAL GIFTS</span>
           <div className="text-5xl font-bold text-gray-900">
             {data?.totalGifts}
           </div>
        </div>
      </div>

      {/* THE LIVE TICKER */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700">Recent Transactions</h3>
        </div>
        
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {data?.recentGifts.map((gift) => (
            <div key={gift.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                  ₹
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {gift.sender || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500">
                    via {gift.collectorName} • {new Date(gift.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">
                +₹{gift.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}