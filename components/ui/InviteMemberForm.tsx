'use client'

import { addTeamMembers } from "@/app/actions/team" // Check path
import { useState } from "react"

export default function InviteMemberForm({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState<string>("")
  const [isError, setIsError] = useState(false)

  async function handleSubmit(formData: FormData) {
    setMessage("")
    setIsError(false)
    const result = await addTeamMembers(formData)

    if (result.error) {
      setIsError(true)
      setMessage(result.error)
    } else if (result.success) {
      setIsError(false)
      setMessage(result.success as string)
    }
  }

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-semibold text-sm mb-2">Invite a Collector</h3>
      
      <form action={handleSubmit} className="flex gap-2">
        <input type="hidden" name="eventId" value={eventId} />
        
        <input 
          name="email" 
          type="email" 
          placeholder="cousin@gmail.com"
          className="flex-1 p-2 border rounded text-sm"
          required 
        />
        
        <button 
          type="submit" 
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
        >
          Add
        </button>
      </form>
      {message && (
        <p className={`text-xs mt-2 ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  )
}