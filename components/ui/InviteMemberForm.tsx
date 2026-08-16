'use client'

import { addTeamMembers } from "@/app/actions/team"
import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

export default function InviteMemberForm({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState<string>("")
  const [isError, setIsError] = useState(false)
  const [focused, setFocused] = useState(false)
  const reduce = useReducedMotion()

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
    <div>
      <h3 className="text-sm font-medium text-forest-depths">
        Invite a collector
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-pewter">
        Add team members by email to help collect envelopes.
      </p>

      <form action={handleSubmit} className="mt-4 space-y-3">
        <input type="hidden" name="eventId" value={eventId} />
        <motion.div
          animate={
            focused && !reduce
              ? { scale: 1.01 }
              : { scale: 1 }
          }
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <input
            name="email"
            type="email"
            placeholder="cousin@gmail.com"
            className="input-light w-full"
            required
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </motion.div>
        <motion.button
          type="submit"
          whileTap={reduce ? undefined : { scale: 0.98 }}
          className="btn-primary w-full"
        >
          Send invite
        </motion.button>
      </form>

      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 text-xs ${isError ? "text-pewter" : "text-eucalyptus"}`}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
