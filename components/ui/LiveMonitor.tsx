"use client";

import { getLiveAnalytics, type AnalyticsData } from "@/app/actions/analytics";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AnimatedNumber, fadeUp } from "./motion";

export default function LiveMonitor({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pulse, setPulse] = useState(false);
  const prevGiftCount = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const fetchData = async () => {
      const result = await getLiveAnalytics(eventId);
      if ("error" in result) {
        setError(result.error);
      } else {
        if (
          prevGiftCount.current > 0 &&
          result.totalGifts > prevGiftCount.current
        ) {
          setPulse(true);
          setTimeout(() => setPulse(false), 600);
        }
        prevGiftCount.current = result.totalGifts;
        setData(result);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (error)
    return (
      <div className="rounded-2xl bg-warm-stone p-6 text-sm text-pewter">
        {error}
      </div>
    );

  if (loading && !data)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-warm-stone sm:h-32"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-warm-stone lg:h-[420px]" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <motion.div
          animate={pulse && !reduce ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-forest-depths p-6 sm:p-8"
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-snow-white/50">
            Total collected
          </p>
          <div className="mt-2 flex items-baseline gap-1 sm:mt-3">
            <span className="font-mono text-sm text-lime-pulse">₹</span>
            <AnimatedNumber
              value={data?.totalAmount ?? 0}
              className="font-mono text-3xl font-light tracking-tight text-snow-white sm:text-4xl lg:text-5xl"
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-2xl bg-warm-stone p-6 sm:p-8"
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-pewter">
            Total envelopes
          </p>
          <div className="mt-2 flex items-baseline gap-2 sm:mt-3">
            <AnimatedNumber
              value={data?.totalGifts ?? 0}
              className="font-mono text-3xl font-light tracking-tight text-forest-depths sm:text-4xl lg:text-5xl"
            />
            <span className="text-sm text-pewter">processed</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Live feed */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-warm-stone lg:col-span-2 lg:max-h-[480px]">
          <div className="flex items-center justify-between border-b border-frosted-glass p-4">
            <h3 className="text-[10px] font-medium uppercase tracking-widest text-pewter">
              Live feed
            </h3>
            <span className="flex items-center gap-1.5 rounded-full bg-lime-pulse px-2 py-0.5 text-[10px] font-medium text-forest-depths">
              {!reduce && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest-depths" />
              )}
              Live
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {data?.recentGifts.length === 0 && (
              <div className="p-8 text-center text-sm italic text-pewter">
                Waiting for first envelope…
              </div>
            )}
            <AnimatePresence initial={false}>
              {data?.recentGifts.map((gift, i) => (
                <motion.div
                  key={gift.id}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="flex items-center justify-between border-b border-frosted-glass/50 px-4 py-3 transition-colors hover:bg-snow-white/50"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate text-sm font-medium text-forest-depths">
                      {gift.sender || "Anonymous"}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] uppercase tracking-wide text-pewter">
                      {gift.collectorName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-medium text-forest-depths">
                      +₹{(gift.amount ?? 0).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-pewter">
                      {new Date(gift.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-warm-stone lg:col-span-3">
          <div className="border-b border-frosted-glass p-4">
            <h3 className="text-[10px] font-medium uppercase tracking-widest text-pewter">
              Bag performance
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead>
                <tr className="border-b border-frosted-glass">
                  {["Bag #", "Collector", "Status", "Collected"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-pewter ${
                        i === 3 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.batchStats.map((batch, i) => (
                  <motion.tr
                    key={batch.batchId}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-frosted-glass/50 transition-colors hover:bg-snow-white/40"
                  >
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full border border-forest-depths px-2 py-0.5 font-mono text-[10px] text-forest-depths">
                        #{batch.bagNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-forest-depths">
                        {batch.collectorName}
                      </p>
                      <p className="mt-0.5 text-xs text-pewter">
                        {batch.giftCount} items
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {batch.isActive ? (
                        <span className="badge-lime text-[10px]">Active</span>
                      ) : (
                        <span className="badge-outline text-[10px]">Idle</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-sm font-medium text-forest-depths">
                        ₹{batch.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.batchStats.length === 0 && (
            <div className="p-8 text-center text-sm italic text-pewter">
              No bags opened yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
