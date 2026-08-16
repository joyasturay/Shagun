'use client'

import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

export default function BatchQR({ 
  batchId, 
  bagNumber, 
  eventName 
}: { 
  batchId: string, 
  bagNumber: number, 
  eventName: string 
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const collectionUrl = `${origin}/collect/${batchId}`

  return (
    <div className="flex flex-col items-center bg-snow-white p-8">
      <span className="code-pill mb-6">Bag #{bagNumber}</span>

      <div className="mb-6 rounded-2xl border-[1.5px] border-forest-depths p-4">
        <QRCodeSVG 
          value={collectionUrl} 
          size={200}
          level={"H"} 
          includeMargin={true}
        />
      </div>
      
      <h3 className="text-[length:var(--text-subheading)] font-light text-forest-depths">
        {eventName}
      </h3>
      
      <p className="mt-2 max-w-[200px] break-all text-center font-seed-sans-mono text-[length:var(--text-label)] tracking-[0.015em] text-pewter">
        {batchId}
      </p>
      
      <button 
        onClick={() => window.print()} 
        className="btn-text mt-6 print:hidden"
      >
        Print label →
      </button>

      <div className="mt-6 w-full border-t border-frosted-glass pt-6 print:hidden">
        <Link href={`/collect/${batchId}`} className="btn-primary w-full">
          Open on this device →
        </Link>
      </div>
    </div>
  )
}
