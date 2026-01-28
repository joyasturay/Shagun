"use client";

import { useActionState, useEffect } from "react";
import { register } from "@/app/actions/register";
import { toast } from "sonner";

const initialState = { error: "" };

export default function FormClient() {
  const [state, action] = useActionState(register, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <form action={action} className="space-y-4">
      <input name="name" placeholder="Name" className="w-full border p-2" required/>
      <input name="email" type="email" placeholder="Email" className="w-full border p-2" required/>
      <input name="password" type="password" placeholder="Password" className="w-full border p-2" required/>

      <button className="w-full bg-blue-600 p-2 text-white">
        Sign Up
      </button>
    </form>
  );
}
