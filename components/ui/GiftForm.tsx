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
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  async function handleSubmit(formData: FormData) {
    setStatus("UPLOADING")
    setMsg("")

    let imageUrl = ""
    if (file) {
      const url = await uploadImageToS3(file)
      if (!url) {
        setStatus("ERROR")
        setMsg("Image upload failed. Try again.")
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
      setMsg(result.error)
      toast.error(result.error)
    } else {
      setStatus("SUCCESS")
      toast.success("Gift saved!")
      formRef.current?.reset()
      setFile(null)
      setPreview(null)
      setTimeout(() => {
        setStatus("IDLE")
        setMsg("")
      }, 3000)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mx-auto max-w-md space-y-6">
      <input type="hidden" name="batchId" value={batchId} />

      <div>
        <label className="label-field text-snow-white/70">Amount (₹)</label>
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          step="1"
          placeholder="501"
          className="input-dark w-full text-center font-seed-sans-mono text-[length:var(--text-heading-sm)] font-medium tracking-[0.015em]"
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="label-field text-snow-white/70">From (optional)</label>
          <input
            name="sender"
            type="text"
            placeholder="e.g. Sharma Family"
            className="input-dark"
          />
        </div>

        <div>
          <label className="label-field text-snow-white/70">Note (optional)</label>
          <textarea
            name="note"
            placeholder="Blessings..."
            className="input-dark h-20 resize-none"
          />
        </div>

        <div>
          <label className="label-field text-snow-white/70">Evidence</label>
          {preview ? (
            <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-snow-white/20">
              <Image src={preview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute right-2 top-2 rounded-full bg-forest-depths px-3 py-1 text-[length:var(--text-label)] text-snow-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-snow-white/30 transition-colors hover:border-snow-white/60">
              <span className="text-[length:var(--text-caption)] text-snow-white/70">Tap to snap photo</span>
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

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "UPLOADING" || status === "SAVING"}
          className={`w-full rounded-full py-4 text-[length:var(--text-body-sm)] font-medium transition-opacity disabled:cursor-wait ${
            status === "ERROR"
              ? "bg-ash text-forest-depths"
              : status === "SUCCESS"
              ? "bg-lime-pulse text-forest-depths"
              : status === "UPLOADING" || status === "SAVING"
              ? "bg-ash text-pewter"
              : "bg-snow-white text-forest-depths hover:opacity-90"
          }`}
        >
          {status === "UPLOADING" && "Compressing & uploading…"}
          {status === "SAVING" && "Saving gift…"}
          {status === "SUCCESS" && "Saved! Next?"}
          {status === "ERROR" && "Retry"}
          {status === "IDLE" && "Save gift"}
        </button>
        {msg && (
          <p className="mt-4 text-center text-[length:var(--text-caption)] text-snow-white/70">
            {msg}
          </p>
        )}
      </div>
    </form>
  )
}
