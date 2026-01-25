// app/collector/page.tsx
'use client'
import { useState } from 'react'
import { envelopeService } from '@/db/services/main'
import { stashGift } from '../actions/stash-gift'

export default function CollectorCam({ currentBatchId }: { currentBatchId: string }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    setIsUploading(true)
    const file = e.target.files[0]

    try {
      // 1. Upload Image (Supabase)
      const url = await envelopeService.uploadEnvelope(file)
      
      // 2. Save Record (Neon)
      await stashGift(currentBatchId, url)
      
      alert("Stashed successfully!")
    } catch (err) {
      alert("Failed to save envelope")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" // Forces rear camera on mobile
        onChange={handleCapture}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {isUploading && <p>Uploading...</p>}
    </div>
  )
}