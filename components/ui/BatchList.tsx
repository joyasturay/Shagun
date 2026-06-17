"use client";

import { createBatch } from "@/app/actions/batches";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BatchQR from "./BatchQR";

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

  const handleCreate = async (subEventId: string) => {
    setLoadingId(subEventId);
    await createBatch(subEventId);
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {selectedBatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:absolute print:inset-0">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden print:shadow-none print:w-full">
            <button
              onClick={() => setSelectedBatch(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition print:hidden"
            >
              ✕
            </button>
            <BatchQR
              batchId={selectedBatch.id}
              bagNumber={selectedBatch.number}
              eventName={selectedBatch.eventName}
            />
          </div>
        </div>
      )}

      {subEvents.map((sub) => (
        <div
          key={sub.id}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(sub.Date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCreate(sub.id)}
              disabled={loadingId === sub.id}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-all shadow-sm active:scale-95"
            >
              {loadingId === sub.id ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Opening
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Open New Bag
                </>
              )}
            </button>
          </div>

          <div className="p-5">
            {sub.Batches.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">
                  No bags opened for {sub.name} yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sub.Batches.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() =>
                      setSelectedBatch({
                        id: batch.id,
                        number: batch.bagNumber,
                        eventName: sub.name,
                      })
                    }
                    className={`group relative p-4 rounded-xl border text-left transition-all overflow-hidden ${
                      batch.isSealed
                        ? "bg-slate-50 border-slate-200 opacity-70"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${
                        batch.isSealed
                          ? "bg-slate-300"
                          : "bg-gradient-to-r from-emerald-400 to-teal-400"
                      }`}
                    />

                    <div className="flex items-start justify-between mt-1">
                      <span className="text-2xl font-bold text-slate-900">
                        #{batch.bagNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          batch.isSealed
                            ? "bg-slate-200 text-slate-600"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                      >
                        {!batch.isSealed && (
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        {batch.isSealed ? "Sealed" : "Active"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-700">
                        {batch._count.Gifts}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        items
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                      View QR
                      <svg
                        className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
