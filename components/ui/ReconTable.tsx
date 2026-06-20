'use client'
import { verifyGift } from "@/app/actions/reconciliation"
import { useState, useTransition, useMemo } from "react"

type Gift = {
  id: string;
  amount: number | null;
  sender: string | null;
  status: string;
  imageUrl?: string | null;
  bagNumber?: number;
  collectedBy?: string;
}

export default function ReconTable({ gifts, eventId }: { gifts: Gift[], eventId: string }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticGifts, setOptimisticGifts] = useState(gifts)

  const handleStatus = (giftId: string, status: 'PROCESSED' | 'FLAGGED') => {
    setOptimisticGifts(current =>
      current.map(g => g.id === giftId ? { ...g, status } : g)
    )

    startTransition(() => {
      verifyGift(giftId, status, eventId)
    })
  }

  // Totals recompute live as the admin flags/verifies envelopes
  const totals = useMemo(() => {
    let gross = 0
    let flagged = 0
    for (const g of optimisticGifts) {
      const amt = g.amount ?? 0
      gross += amt
      if (g.status === 'FLAGGED') flagged += amt
    }
    return { gross, flagged, net: gross - flagged }
  }, [optimisticGifts])

  // Per-collector breakdown (flagged amounts excluded from each collector's verified total)
  const collectors = useMemo(() => {
    const map = new Map<string, { name: string; count: number; net: number; flagged: number }>()
    for (const g of optimisticGifts) {
      const name = g.collectedBy || "Unknown"
      const entry = map.get(name) ?? { name, count: 0, net: 0, flagged: 0 }
      const amt = g.amount ?? 0
      entry.count += 1
      if (g.status === 'FLAGGED') entry.flagged += amt
      else entry.net += amt
      map.set(name, entry)
    }
    return [...map.values()].sort((a, b) => b.net - a.net)
  }, [optimisticGifts])

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gross Collected</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{inr(totals.gross)}</p>
        </div>
        <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Flagged (Deducted)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">− {inr(totals.flagged)}</p>
        </div>
        <div className="bg-emerald-600 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Net Verified Total</p>
          <p className="text-2xl font-bold text-white mt-1">{inr(totals.net)}</p>
        </div>
      </div>

      {/* Per-collector summary */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Collections by Person</h3>
          <p className="text-xs text-gray-500 mt-0.5">Who collected what — flagged amounts excluded from net.</p>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-2.5">Collector</th>
              <th className="px-6 py-2.5 text-right">Envelopes</th>
              <th className="px-6 py-2.5 text-right">Flagged</th>
              <th className="px-6 py-2.5 text-right">Net Collected</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {collectors.map((c) => (
              <tr key={c.name}>
                <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  {c.name}
                </td>
                <td className="px-6 py-3 text-right text-gray-600">{c.count}</td>
                <td className="px-6 py-3 text-right text-red-500">{c.flagged > 0 ? `− ${inr(c.flagged)}` : "—"}</td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">{inr(c.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Envelope-level table */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Photo</th>
              <th className="px-6 py-3">Sender</th>
              <th className="px-6 py-3">Collected By</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {optimisticGifts.map((g) => (
              <tr key={g.id} className={g.status === 'PROCESSED' ? 'bg-green-50' : g.status === 'FLAGGED' ? 'bg-red-50' : ''}>

                <td className="px-6 py-4">
                  {g.imageUrl ? (
                    <a href={g.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={g.imageUrl}
                        alt="Envelope"
                        className="w-12 h-12 object-cover rounded border border-gray-300 shadow-sm hover:scale-110 transition cursor-pointer"
                      />
                    </a>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 border-dashed flex items-center justify-center text-[10px] text-gray-400 text-center">
                      No<br/>Photo
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 font-medium">{g.sender || 'Anonymous'}</td>
                <td className="px-6 py-4 text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {(g.collectedBy || "U").charAt(0).toUpperCase()}
                    </span>
                    {g.collectedBy || "Unknown"}
                  </span>
                </td>
                <td className={`px-6 py-4 font-bold ${g.status === 'FLAGGED' ? 'line-through text-gray-400' : ''}`}>
                  {g.amount ? `₹${g.amount}` : <span className="text-gray-400 italic">Empty</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    g.status === 'UNPROCESSED' ? 'bg-yellow-100 text-yellow-800' :
                    g.status === 'PROCESSED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {g.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {g.status === 'UNPROCESSED' && (
                    <>
                      <button onClick={() => handleStatus(g.id, 'PROCESSED')} className="text-xl hover:scale-110 transition" title="Verify Cash Matches">✅</button>
                      <button onClick={() => handleStatus(g.id, 'FLAGGED')} className="text-xl hover:scale-110 transition" title="Flag Discrepancy">🚩</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
