'use client'
import { verifyGift } from "@/app/actions/reconciliation"
import { useState, useTransition } from "react"

// 1. UPDATE TYPE: Add imageUrl
type Gift = { 
  id: string; 
  amount: number | null; 
  sender: string | null; 
  status: string;
  imageUrl?: string | null; 
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

  return (
    <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {/* 2. NEW HEADER FOR PHOTO */}
            <th className="px-6 py-3">Photo</th>
            <th className="px-6 py-3">Sender</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {optimisticGifts.map((g) => (
            <tr key={g.id} className={g.status === 'PROCESSED' ? 'bg-green-50' : g.status === 'FLAGGED' ? 'bg-red-50' : ''}>
              
              {/* 3. THE IMAGE CELL */}
              <td className="px-6 py-4">
                {g.imageUrl ? (
                  <a href={g.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                    {/* Using standard img tag to avoid Next.js domain config errors during your sprint */}
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
              <td className="px-6 py-4 font-bold">
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
  )
}