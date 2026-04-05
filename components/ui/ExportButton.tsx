'use client'
import { exportEventData } from "@/app/actions/export"

export default function ExportButton({ eventId }: { eventId: string }) {
  const handleDownload = async () => {
    const result = await exportEventData(eventId)
    if (result.error) return alert(result.error)
    
    const blob = new Blob([result.csv!], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename!
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition">
      📥 Download Excel
    </button>
  )
}