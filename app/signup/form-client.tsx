"use client";

import { useActionState, useEffect } from "react";
import { register } from "@/app/actions/register";
import { toast } from "sonner";
import Link from "next/link";

const initialState = { error: "" };

export default function FormClient() {
  const [state, action, isPending] = useActionState(register, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <span className="text-[#09090b] font-black text-sm leading-none">S</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Shagun<span className="text-amber-400">.ai</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#111113] border border-white/6 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">Create your account</h1>
            <p className="text-sm text-zinc-500 mt-1">Set up your wedding ledger in 2 minutes</p>
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Full name</label>
              <input
                name="name"
                required
                placeholder="Rahul Sharma"
                className="w-full bg-[#09090b] border border-white/8 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-[#09090b] border border-white/8 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#09090b] border border-white/8 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#09090b] font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
