"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import InviteMemberForm from "./InviteMemberForm";
import BatchList from "./BatchList";
import LiveMonitor from "./LiveMonitor";
import ConversationalAudit from "./ConversationalAudit";
import { FadeIn, Stagger, fadeUp } from "./motion";

type Batch = {
  id: string;
  bagNumber: number;
  isSealed: boolean;
  _count: { Gifts: number };
};

type SubeventWithBatches = {
  id: string;
  name: string;
  Date: Date;
  Batches: Batch[];
};

type EventStats = {
  ceremonies: number;
  bags: number;
  envelopes: number;
  activeBags: number;
};

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={fadeUp}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`rounded-2xl p-4 sm:p-5 ${
        accent ? "bg-forest-depths text-snow-white" : "bg-warm-stone"
      }`}
    >
      <p
        className={`text-[10px] font-medium uppercase tracking-widest ${
          accent ? "text-snow-white/50" : "text-pewter"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-2xl font-medium tracking-tight sm:text-3xl ${
          accent ? "text-snow-white" : "text-forest-depths"
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}

function SectionHeader({
  title,
  description,
  id,
}: {
  title: string;
  description: string;
  id?: string;
}) {
  return (
    <motion.div variants={fadeUp} id={id} className="mb-5 sm:mb-6">
      <h2 className="text-xl font-light tracking-tight text-forest-depths sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-pewter">{description}</p>
    </motion.div>
  );
}

export function EventDashboardAdmin({
  eventId,
  subEvents,
  stats,
}: {
  eventId: string;
  subEvents: SubeventWithBatches[];
  stats: EventStats;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Recon entry — primary post-event workflow */}
      <FadeIn>
        <Link
          href={`/dashboard/event/${eventId}/reconcile`}
          className="group flex flex-col gap-4 rounded-2xl bg-forest-depths p-6 transition-opacity hover:opacity-95 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-snow-white/50">
              Post-event
            </p>
            <h2 className="mt-1 text-xl font-light text-snow-white sm:text-2xl">
              Audit & reconciliation
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-snow-white/65">
              Verify cash against photos, flag discrepancies, and download a
              CSV for the family accountant.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span className="rounded-full bg-lime-pulse px-3 py-1.5 text-xs font-medium text-forest-depths">
              {stats.envelopes} envelope{stats.envelopes === 1 ? "" : "s"}
            </span>
            <span className="rounded-full border border-snow-white/30 px-5 py-2.5 text-sm text-snow-white transition-colors group-hover:bg-snow-white/10">
              Open recon page →
            </span>
          </div>
        </Link>
      </FadeIn>

      {/* Quick stats */}
      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatPill label="Ceremonies" value={stats.ceremonies} />
        <StatPill label="Bags open" value={stats.bags} accent />
        <StatPill label="Envelopes" value={stats.envelopes} />
        <StatPill label="Active now" value={stats.activeBags} />
      </Stagger>

      {/* Bento: bags + sidebar */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <FadeIn className="lg:col-span-8" delay={0.05}>
          <section>
            <SectionHeader
              title="Bag management"
              description="Open collection bags and share QR codes with your team."
            />
            <BatchList subEvents={subEvents} />
          </section>
        </FadeIn>

        <FadeIn className="space-y-4 lg:col-span-4" delay={0.1}>
          <motion.div
            layout={!reduce}
            className="rounded-2xl bg-warm-stone p-5 sm:p-6"
          >
            <InviteMemberForm eventId={eventId} />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-frosted-glass bg-snow-white p-5 sm:p-6"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-pewter">
              Quick actions
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/dashboard/event/${eventId}/reconcile`}
                className="group flex items-center justify-between rounded-xl bg-warm-stone px-4 py-3 text-sm text-forest-depths transition-colors hover:bg-frosted-glass/40"
              >
                <span>Audit & reconciliation</span>
                <span className="text-pewter transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm text-pewter transition-colors hover:bg-warm-stone hover:text-forest-depths"
              >
                <span>All events</span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-forest-depths p-5 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {!reduce && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-pulse opacity-60" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-pulse" />
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-snow-white/60">
                Live status
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-snow-white/70">
              Collectors can scan envelopes into any active bag. Totals refresh
              every 5 seconds below.
            </p>
          </motion.div>
        </FadeIn>
      </div>

      {/* Live monitor */}
      <FadeIn delay={0.12}>
        <section>
          <SectionHeader
            title="Live monitor"
            description="Real-time collection totals and team activity."
          />
          <LiveMonitor eventId={eventId} />
        </section>
      </FadeIn>

      {/* AI audit */}
      <FadeIn delay={0.16}>
        <section>
          <SectionHeader
            title="AI audit engine"
            description="Scan all bags for duplicates and resolve issues conversationally."
          />
          <ConversationalAudit eventId={eventId} />
        </section>
      </FadeIn>
    </div>
  );
}
