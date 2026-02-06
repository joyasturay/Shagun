"use client"
import { useFormStatus } from "react-dom";

export const Submitbutton = () => {
    const { pending } = useFormStatus()
    return (
        <button type="submit"
            disabled={pending}
            className={`px-6 py-2 rounded text-white transition-all ${pending ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}>
            {pending?"Creating event...":"Create Event"}
       </button>
    )
}