"use client";

import { useActionState, useEffect } from "react";
import { register } from "@/app/actions/register";
import { toast } from "sonner";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

const initialState = { error: "" };

export default function FormClient() {
  const [state, action, isPending] = useActionState(register, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-snow-white px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <BrandLogo href="/" />
        </div>

        <div className="card-surface p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-[length:var(--text-subheading)] font-light leading-[var(--leading-subheading)] tracking-[var(--tracking-subheading)] text-forest-depths">
              Create your account
            </h1>
            <p className="mt-2 text-[length:var(--text-caption)] text-pewter">
              Set up your wedding ledger in 2 minutes
            </p>
          </div>

          <form action={action} className="space-y-5">
            <div>
              <label className="label-field">Full name</label>
              <input
                name="name"
                required
                placeholder="Rahul Sharma"
                className="input-light"
              />
            </div>

            <div>
              <label className="label-field">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="input-light"
              />
            </div>

            <div>
              <label className="label-field">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-light"
              />
            </div>

            <button type="submit" disabled={isPending} className="btn-primary mt-2 w-full">
              {isPending ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[length:var(--text-caption)] text-pewter">
          Already have an account?{" "}
          <Link href="/login" className="btn-text text-[length:var(--text-caption)] no-underline hover:underline">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
