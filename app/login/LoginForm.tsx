"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "../actions/login";
type LoginState =
  | { success: true }
  | { error: string }

const initialState:LoginState = {success:true,error:""}; 
export default function LoginForm() {
  const router = useRouter();
  const [state, action] = useActionState(loginAction, initialState);

  useEffect(() => {
    if ("error" in state) {
      toast.error(state.error);
    }

    if ("success" in state) {
      toast.success("Logged in successfully");
      router.push("/");
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input name="email" required className="border p-2 w-full" />
      <input name="password" type="password" required className="border p-2 w-full" />
      <button className="bg-blue-600 text-white p-2 w-full">
        Login
      </button>
    </form>
  );
}
