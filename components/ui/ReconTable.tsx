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

  const totals = useMemo(() => {
    let gross = 0, verified = 0, pending = 0, flagged = 0
    for (const g of optimisticGifts) {
      const amt = g.amount ?? 0
      gross += amt
      if (g.status === 'FLAGGED') flagged += amt
      else if (g.status === 'PROCESSED') verified += amt
      else pending += amt
    }
    return { gross, verified, pending, flagged }
  }, [optimisticGifts])

  const collectors = useMemo(() => {
    const map = new Map<string, { name: string; count: number; verified: number; pending: number; flagged: number }>()
    for (const g of optimisticGifts) {
      const name = g.collectedBy || "Unknown"
      const entry = map.get(name) ?? { name, count: 0, verified: 0, pending: 0, flagged: 0 }
      const amt = g.amount ?? 0
      entry.count += 1
      if (g.status === 'FLAGGED') entry.flagged += amt
      else if (g.status === 'PROCESSED') entry.verified += amt
      else entry.pending += amt
      map.set(name, entry)
    }
    return [...map.values()].sort((a, b) => (b.verified + b.pending) - (a.verified + a.pending))
  }, [optimisticGifts])

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-warm-stone p-6">
          <p className="section-label">Gross collected</p>
          <p className="mt-2 font-seed-sans-mono text-[length:var(--text-subheading)] font-medium tracking-[0.015em] text-forest-depths">
            {inr(totals.gross)}
          </p>
          <p className="mt-1 text-[length:var(--text-label)] text-pewter">Everything scanned</p>
        </div>
        <div className="rounded-2xl bg-forest-depths p-6">
          <p className="section-label text-snow-white/60">Verified</p>
          <p className="mt-2 font-seed-sans-mono text-[length:var(--text-subheading)] font-medium tracking-[0.015em] text-snow-white">
            {inr(totals.verified)}
          </p>
          <p className="mt-1 text-[length:var(--text-label)] text-snow-white/50">Cash confirmed</p>
        </div>
        <div className="rounded-2xl bg-warm-stone p-6">
          <p className="section-label">Pending</p>
          <p className="mt-2 font-seed-sans-mono text-[length:var(--text-subheading)] font-medium tracking-[0.015em] text-olive-gold">
            {inr(totals.pending)}
          </p>
          <p className="mt-1 text-[length:var(--text-label)] text-pewter">Not yet checked</p>
        </div>
        <div className="rounded-2xl bg-warm-stone p-6">
          <p className="section-label">Flagged</p>
          <p className="mt-2 font-seed-sans-mono text-[length:var(--text-subheading)] font-medium tracking-[0.015em] text-sage-moss">
            {inr(totals.flagged)}
          </p>
          <p className="mt-1 text-[length:var(--text-label)] text-pewter">Discrepancy</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-warm-stone">
        <div className="border-b border-frosted-glass px-6 py-4">
          <h3 className="text-[length:var(--text-caption)] font-medium text-forest-depths">
            Collections by person
          </h3>
          <p className="mt-0.5 text-[length:var(--text-label)] text-pewter">
            Who collected what — flagged amounts excluded from net.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[length:var(--text-caption)]">
            <thead>
              <tr className="border-b border-frosted-glass">
                <th className="px-6 py-3 section-label">Collector</th>
                <th className="px-6 py-3 text-right section-label">Envelopes</th>
                <th className="px-6 py-3 text-right section-label">Verified</th>
                <th className="px-6 py-3 text-right section-label">Pending</th>
                <th className="px-6 py-3 text-right section-label">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {collectors.map((c) => (
                <tr key={c.name} className="border-b border-frosted-glass/50">
                  <td className="px-6 py-3 font-medium text-forest-depths">{c.name}</td>
                  <td className="px-6 py-3 text-right text-pewter">{c.count}</td>
                  <td className="px-6 py-3 text-right font-seed-sans-mono font-medium text-forest-depths">{inr(c.verified)}</td>
                  <td className="px-6 py-3 text-right font-seed-sans-mono text-olive-gold">{c.pending > 0 ? inr(c.pending) : "—"}</td>
                  <td className="px-6 py-3 text-right font-seed-sans-mono text-sage-moss">{c.flagged > 0 ? inr(c.flagged) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-warm-stone">
        <table className="w-full text-left text-[length:var(--text-caption)]">
          <thead>
            <tr className="border-b border-frosted-glass">
              <th className="px-6 py-3 section-label">Photo</th>
              <th className="px-6 py-3 section-label">Sender</th>
              <th className="px-6 py-3 section-label">Collected by</th>
              <th className="px-6 py-3 section-label">Amount</th>
              <th className="px-6 py-3 section-label">Status</th>
              <th className="px-6 py-3 text-right section-label">Action</th>
            </tr>
          </thead>
          <tbody>
            {optimisticGifts.map((g) => (
              <tr
                key={g.id}
                className={
                  g.status === 'PROCESSED'
                    ? 'bg-snow-white/60'
                    : g.status === 'FLAGGED'
                    ? 'bg-frosted-glass/20'
                    : ''
                }
              >
                <td className="px-6 py-4">
                  {g.imageUrl ? (
                    <a href={g.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={g.imageUrl}
                        alt="Envelope"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-frosted-glass text-[10px] text-pewter">
                      No photo
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-forest-depths">{g.sender || 'Anonymous'}</td>
                <td className="px-6 py-4 text-pewter">{g.collectedBy || "Unknown"}</td>
                <td className={`px-6 py-4 font-seed-sans-mono font-medium ${g.status === 'FLAGGED' ? 'text-pewter line-through' : 'text-forest-depths'}`}>
                  {g.amount ? inr(g.amount) : <span className="italic text-pewter">Empty</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={
                    g.status === 'UNPROCESSED' ? 'badge-lime text-[10px]' :
                    g.status === 'PROCESSED' ? 'badge-outline text-[10px]' :
                    'badge-outline text-[10px] text-sage-moss border-sage-moss'
                  }>
                    {g.status}
                  </span>
                </td>
                <td className="space-x-2 px-6 py-4 text-right">
                  {g.status === 'UNPROCESSED' && (
                    <>
                      <button
                        onClick={() => handleStatus(g.id, 'PROCESSED')}
                        disabled={isPending}
                        className="btn-inverted px-3 py-1.5 text-[length:var(--text-label)]"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleStatus(g.id, 'FLAGGED')}
                        disabled={isPending}
                        className="rounded-full border-[1.5px] border-sage-moss px-3 py-1.5 text-[length:var(--text-label)] text-sage-moss"
                      >
                        Flag
                      </button>
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
