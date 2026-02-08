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

  // STATE FOR MODAL
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
    <div className="space-y-8 mt-8">
      {/* 1. THE MODAL (Overlay) */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:bg-white print:absolute print:inset-0">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full relative overflow-hidden print:shadow-none print:w-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBatch(null)}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-black print:hidden"
            >
              ✕
            </button>

            {/* QR Component */}
            <BatchQR
              batchId={selectedBatch.id}
              bagNumber={selectedBatch.number}
              eventName={selectedBatch.eventName}
            />
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold border-b pb-2">Bag Management</h2>

      {subEvents.map((sub) => (
        <div key={sub.id} className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold">{sub.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(sub.Date).toDateString()}
              </p>
            </div>

            <button
              onClick={() => handleCreate(sub.id)}
              disabled={loadingId === sub.id}
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loadingId === sub.id ? "Opening..." : "+ Open New Bag"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sub.Batches.map((batch) => (
              <div
                key={batch.id}
                onClick={() =>
                  setSelectedBatch({
                    id: batch.id,
                    number: batch.bagNumber,
                    eventName: sub.name,
                  })
                } // <--- CLICK TO OPEN
                className={`p-4 border rounded-lg text-center cursor-pointer transition relative group ${
                  batch.isSealed
                    ? "bg-gray-100 opacity-60"
                    : "bg-green-50 border-green-200 hover:shadow-md hover:-translate-y-1"
                }`}
              >
                <h4 className="text-2xl font-bold text-gray-800">
                  #{batch.bagNumber}
                </h4>
                <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                  {batch.isSealed ? "Sealed" : "Active"}
                </p>
                <div className="mt-2 text-sm font-medium text-gray-600">
                  {batch._count.Gifts} items
                </div>

                {/* Visual Cue */}
                <span className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition">
                  🔍
                </span>
              </div>
            ))}
            {/* Empty State */}
            {sub.Batches.length === 0 && (
              <div className="col-span-full py-8 text-center bg-gray-50 rounded border border-dashed border-gray-200">
                <p className="text-gray-400 italic text-sm">
                  No bags opened for {sub.name} yet.
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
