"use client";

import { createBatch } from "@/app/actions/batches";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import BatchQR from "./BatchQR";
import { fadeUp, scaleIn } from "./motion";

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

export default function BatchList({
  subEvents,
}: {
  subEvents: SubeventWithBatches[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<{
    id: string;
    number: number;
    eventName: string;
  } | null>(null);
  const router = useRouter();
  const reduce = useReducedMotion();

  const handleCreate = async (subEventId: string) => {
    setLoadingId(subEventId);
    await createBatch(subEventId);
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AnimatePresence>
        {selectedBatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-forest-depths/40 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setSelectedBatch(null)}
          >
            <motion.div
              initial={reduce ? "show" : "hidden"}
              animate="show"
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              variants={scaleIn}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="relative w-full max-w-sm overflow-hidden rounded-t-3xl bg-snow-white sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedBatch(null)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-pewter transition-colors hover:bg-warm-stone hover:text-forest-depths"
                aria-label="Close"
              >
                ✕
              </button>
              <BatchQR
                batchId={selectedBatch.id}
                bagNumber={selectedBatch.number}
                eventName={selectedBatch.eventName}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {subEvents.map((sub, subIdx) => (
        <motion.div
          key={sub.id}
          initial={reduce ? "show" : "hidden"}
          animate="show"
          variants={fadeUp}
          transition={{ delay: subIdx * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl bg-warm-stone"
        >
          <div className="flex flex-col gap-4 border-b border-frosted-glass p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-snow-white text-forest-depths">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-forest-depths sm:text-base">
                  {sub.name}
                </h3>
                <p className="mt-0.5 text-xs text-pewter">
                  {new Date(sub.Date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <motion.button
              onClick={() => handleCreate(sub.id)}
              disabled={loadingId === sub.id}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="btn-primary w-full shrink-0 disabled:opacity-50 sm:w-auto"
            >
              {loadingId === sub.id ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-snow-white/30 border-t-snow-white" />
                  Opening…
                </span>
              ) : (
                "+ Open new bag"
              )}
            </motion.button>
          </div>

          <div className="p-4 sm:p-5">
            {sub.Batches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center rounded-2xl border border-dashed border-frosted-glass py-12 text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-snow-white text-pewter">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-sm text-pewter">
                  No bags opened for {sub.name} yet.
                </p>
                <p className="mt-1 text-xs text-pewter/70">
                  Tap &ldquo;Open new bag&rdquo; to get started
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-5">
                {sub.Batches.map((batch, i) => (
                  <motion.button
                    key={batch.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                    whileHover={reduce ? undefined : { y: -3 }}
                    whileTap={reduce ? undefined : { scale: 0.98 }}
                    onClick={() =>
                      setSelectedBatch({
                        id: batch.id,
                        number: batch.bagNumber,
                        eventName: sub.name,
                      })
                    }
                    className={`group rounded-2xl p-3 text-left transition-colors sm:p-4 ${
                      batch.isSealed
                        ? "bg-snow-white/50 opacity-60"
                        : "bg-snow-white hover:bg-frosted-glass/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-mono text-lg font-medium tracking-tight text-forest-depths sm:text-xl">
                        #{batch.bagNumber}
                      </span>
                      <span
                        className={
                          batch.isSealed
                            ? "badge-outline shrink-0 text-[9px] sm:text-[10px]"
                            : "badge-lime shrink-0 text-[9px] sm:text-[10px]"
                        }
                      >
                        {batch.isSealed ? "Sealed" : "Active"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1 sm:mt-3">
                      <span className="font-mono text-base font-medium text-forest-depths sm:text-lg">
                        {batch._count.Gifts}
                      </span>
                      <span className="text-xs text-pewter">items</span>
                    </div>

                    <div className="mt-1.5 text-xs text-pewter transition-colors group-hover:text-forest-depths sm:mt-2">
                      View QR →
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
