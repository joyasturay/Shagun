"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "./brand-logo";
import LogoutButton from "./LogoutButton";
import { fadeUp } from "./motion";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  badge,
  action,
  backHref,
  backLabel,
  children,
}: DashboardShellProps) {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-snow-white">
      <header className="border-b border-frosted-glass bg-snow-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <BrandLogo href="/dashboard" />
          <LogoutButton />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-6 pt-1 sm:px-6 sm:pb-8 lg:px-8">
          {backHref && (
            <Link
              href={backHref}
              className="mb-3 inline-flex items-center gap-1 text-sm text-pewter underline decoration-[1.5px] underline-offset-4 transition-colors hover:text-forest-depths sm:mb-4"
            >
              ← {backLabel ?? "Back"}
            </Link>
          )}

          <motion.div
            initial={reduce ? "show" : "hidden"}
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="truncate text-2xl font-light tracking-tight text-forest-depths sm:text-3xl lg:text-4xl">
                  {title}
                </h1>
                {badge}
              </div>
              {subtitle && (
                <p className="mt-1.5 max-w-xl text-sm text-pewter sm:mt-2">
                  {subtitle}
                </p>
              )}
            </div>
            {action && (
              <div className="flex shrink-0 flex-wrap gap-2">{action}</div>
            )}
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}
