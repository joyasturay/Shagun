"use client";

import { logout } from "@/app/actions/logout";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-inverted px-5 py-2.5 text-[length:var(--text-caption)] disabled:opacity-50"
    >
      {pending ? "Logging out…" : "Log out"}
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
