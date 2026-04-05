"use client";

import { logout } from "@/app/actions/logout";
import { useFormStatus } from "react-dom";
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="text-sm font-medium text-gray-600 hover:text-rose-900 disabled:text-gray-400 transition"
    >
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}

export default function LogoutButton() {
  return (
    <form action={logout}>
      <SubmitButton />
    </form>
  );
}