"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAction } from "../actions/login";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export type LoginState = {
  success: boolean;
  error: string;
};

const initialState: LoginState = {
  success: false,
  error: "",
};

export default function LoginForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-snow-white px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <BrandLogo href="/" />
        </div>

        <div className="card-surface p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-[length:var(--text-subheading)] font-light leading-[var(--leading-subheading)] tracking-[var(--tracking-subheading)] text-forest-depths">
              Welcome back
            </h1>
            <p className="mt-2 text-[length:var(--text-caption)] text-pewter">
              Sign in to your event dashboard
            </p>
          </div>

          <form action={action} className="space-y-5">
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
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[length:var(--text-caption)] text-pewter">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="btn-text text-[length:var(--text-caption)] no-underline hover:underline">
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
