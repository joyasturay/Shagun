"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "../actions/login";

// 1. Unified the state type to be predictable
export type LoginState = {
  success: boolean;
  error: string;
};

// 2. Set default state to false/empty so it doesn't trigger on mount
const initialState: LoginState = { 
  success: false, 
  error: "" 
}; 

export default function LoginForm() {
  const router = useRouter();
  
  // 3. Extracted 'isPending' for better UI feedback
  const [state, action, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    // 4. Check specific string lengths/booleans rather than the "in" operator
    if (state.error) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success("Logged in successfully");
      // Add your redirect here if your server action doesn't handle it
      router.push("/dashboard"); 
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input 
        name="email" 
        type="email" 
        required 
        placeholder="Email"
        className="border p-2 w-full rounded" 
      />
      <input 
        name="password" 
        type="password" 
        required 
        placeholder="Password"
        className="border p-2 w-full rounded" 
      />
      
      {/* 5. Disabled button while loading */}
      <button 
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white p-2 w-full rounded disabled:bg-blue-400 disabled:cursor-wait transition"
      >
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}