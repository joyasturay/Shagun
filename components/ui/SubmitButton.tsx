"use client"
import { useFormStatus } from "react-dom";

export const Submitbutton = () => {
    const { pending } = useFormStatus()
    return (
        <button type="submit"
            disabled={pending}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? "Creating event..." : "Create Event"}
       </button>
    )
}