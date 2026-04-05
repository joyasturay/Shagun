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
    <div className="flex flex-col items-center p-6 bg-white rounded-lg">
      <div className="bg-white p-4 border-4 border-black rounded-xl mb-4">
        <QRCodeSVG 
          value={collectionUrl} 
          size={200}
          level={"H"} 
          includeMargin={true}
        />
      </div>
      
      <h3 className="text-2xl font-bold mb-1">BAG #{bagNumber}</h3>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
        {eventName}
      </p>
      
      <p className="text-xs text-gray-400 mt-4 max-w-[200px] text-center break-all">
        {batchId}
      </p>
      
      <button 
        onClick={() => window.print()} 
        className="mt-6 text-sm text-blue-600 hover:underline print:hidden"
      >
        🖨️ Print Label
      </button>
      <div className="w-full mt-6 pt-6 border-t border-gray-100 print:hidden">
        <Link 
          href={`/collect/${batchId}`}
          className="flex items-center justify-center w-full bg-black text-white py-3 rounded-lg text-sm font-bold shadow-md hover:bg-gray-800 hover:scale-[1.02] transition-all"
        >
          Open Form on this Device ↗
        </Link>
      </div>
    </div>
  )
}