'use client'

import { getLiveAnalytics, type AnalyticsData } from "@/app/actions/analytics"
import { useEffect, useState } from "react"

export default function LiveMonitor({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const result = await getLiveAnalytics(eventId)
      if ('error' in result) setError(result.error)
      else setData(result)
      setLoading(false)
    }
    
    fetchData()
    const interval = setInterval(fetchData, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [eventId])

  if (error) return <div className="text-red-500 p-4 border border-red-200 rounded">{error}</div>
  if (loading && !data) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>

  return (
    <div className="space-y-6">
      {/* 1. TOP CARDS (Big Numbers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between h-32">
          <span className="text-xs font-medium opacity-70 uppercase tracking-widest">Total Collected</span>
          <div className="text-4xl font-bold">₹ {data?.totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white border p-6 rounded-2xl shadow-sm flex flex-col justify-between h-32">
           <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Total Envelopes</span>
           <div className="text-4xl font-bold text-gray-900">{data?.totalGifts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. LEFT COL: LIVE FEED */}
        <div className="lg:col-span-1 bg-white border rounded-xl overflow-hidden shadow-sm h-fit">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm uppercase">Live Feed</h3>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {data?.recentGifts.map((gift) => (
              <div key={gift.id} className="p-3 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-sm font-semibold text-gray-900">{gift.sender || "Anonymous"}</p>
                      <p className="text-xs text-gray-400">{gift.collectorName}</p>
                   </div>
                   <div className="text-green-600 font-bold text-sm">+₹{gift.amount}</div>
                </div>
                <p className="text-[10px] text-gray-300 mt-1 text-right">{new Date(gift.createdAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RIGHT COL: BATCH BREAKDOWN & ACTIVE STATUS */}
        <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-700 text-sm uppercase">Bag Performance & Team Status</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Bag #</th>
                  <th className="px-6 py-3">Collector</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.batchStats.map((batch) => (
                  <tr key={batch.batchId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">#{batch.bagNumber}</td>
                    
                    {/* Collector Name */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{batch.collectorName}</div>
                      <div className="text-xs text-gray-500">{batch.giftCount} items</div>
                    </td>

                    {/* Active Status */}
                    <td className="px-6 py-4">
                      {batch.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Idle
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                      ₹ {batch.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data?.batchStats.length === 0 && (
            <div className="p-8 text-center text-gray-400 italic">
              No bags have been opened yet.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}