'use client'

import { createGift } from "@/app/actions/gifts"
import { uploadImageToS3 } from "@/app/lib/upload"
import { useRef, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"

export default function GiftForm({ batchId }: { batchId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [msg, setMsg] = useState("")
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "SAVING" | "SUCCESS" | "ERROR">("IDLE")
  
  // Image State
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // 1. Handle File Selection (Show Preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      // Create a fake local URL just for preview
      const objectUrl = URL.createObjectURL(selected)
      setPreview(objectUrl)
    }
  }

  // 2. The Master Submit Handler
  async function handleSubmit(formData: FormData) {
    setStatus("UPLOADING")
    setMsg("")

    let imageUrl = ""


    if (file) {
      const url = await uploadImageToS3(file)
      if (!url) {
        setStatus("ERROR")
        setMsg("❌ Image upload failed. Try again.")
        toast.error("Image upload failed. Try again.")
        return
      }
      imageUrl = url
    }

   
    setStatus("SAVING")
    
    
    formData.set("imageUrl", imageUrl) 

    const result = await createGift(formData)

    if (result.error) {
      setStatus("ERROR")
      setMsg(`❌ ${result.error}`)
      toast.error(`❌ ${result.error}`)

    } else {
      setStatus("SUCCESS")
      toast.success(`Gift Saved!`)
      
      // Reset Form
      formRef.current?.reset()
      setFile(null)
      setPreview(null)
      
      // Auto-hide success message after 3s
      setTimeout(() => {
        setStatus("IDLE")
        setMsg("")
      }, 3000)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <input type="hidden" name="batchId" value={batchId} />

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
        <input 
          name="amount" 
          type="number" 
          inputMode="numeric" 
          pattern="[0-9]*"
          step="1"
          placeholder="501"
          className="w-full text-4xl p-4 border rounded-xl text-center font-bold tracking-widest focus:ring-4 focus:ring-green-100 outline-none border-gray-300"
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Sender Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">From (Optional)</label>
          <input 
            name="sender" 
            type="text" 
            placeholder="e.g. Sharma Family"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Note Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Note (Optional)</label>
          <textarea 
            name="note" 
            placeholder="Blessings..."
            className="w-full p-3 border rounded-lg h-20 resize-none"
          />
        </div>
        
        {/* PHOTO UPLOAD UI */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Evidence</label>
          
          {preview ? (
            // PREVIEW STATE
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
               <Image 
                 src={preview} 
                 alt="Preview" 
                 fill 
                 className="object-cover" 
               />
               <button 
                 type="button"
                 onClick={() => { setFile(null); setPreview(null); }}
                 className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-md text-xs"
               >
                 ✕ Remove
               </button>
            </div>
          ) : (
            // EMPTY STATE
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
               <span className="text-2xl mb-1">📸</span>
               <span className="text-gray-500 text-sm font-medium">Tap to snap photo</span>
               <input 
                 type="file" 
                 accept="image/*" 
                 capture="environment" 
                 className="hidden" 
                 onChange={handleFileChange}
               />
            </label>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
        <button 
          type="submit" 
          disabled={status === "UPLOADING" || status === "SAVING"}
          className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all active:scale-95 ${
             status === "ERROR" ? "bg-red-600" :
             status === "SUCCESS" ? "bg-green-600" :
             (status === "UPLOADING" || status === "SAVING") ? "bg-gray-400 cursor-wait" : 
             "bg-black hover:bg-gray-800"
          }`}
        >
          {status === "UPLOADING" && "Compressing & Uploading..."}
          {status === "SAVING" && "Saving Gift..."}
          {status === "SUCCESS" && "Saved! Next?"}
          {status === "ERROR" && "Retry"}
          {status === "IDLE" && "Save Gift"}
        </button>

        {msg && (
          <p className={`text-center mt-4 font-medium animate-pulse ${
            status === "ERROR" ? "text-red-600" : "text-green-600"
          }`}>
            {msg}
          </p>
        )}
      </div>
    </form>
  )
}