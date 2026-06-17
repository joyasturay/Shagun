"use client";

import { getLiveAnalytics, type AnalyticsData } from "@/app/actions/analytics";
import { useEffect, useState } from "react";

export default function LiveMonitor({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const result = await getLiveAnalytics(eventId);
      if ("error" in result) setError(result.error);
      else setData(result);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (error)
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded">
        {error}
      </div>
    );
  if (loading && !data)
    return <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
            Total Collected
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-emerald-400 text-3xl font-light">₹</span>
            <span className="text-white text-5xl font-bold tracking-tight">
              {data?.totalAmount.toLocaleString() ?? 0}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
            Total Envelopes
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-slate-900 text-5xl font-bold tracking-tight">
              {data?.totalGifts ?? 0}
            </span>
            <span className="text-slate-400 text-sm font-medium">processed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Feed
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {data?.recentGifts.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                No gifts collected yet.
              </div>
            )}
            {data?.recentGifts.map((gift) => (
              <div
                key={gift.id}
                className="flex justify-between items-center p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {gift.sender || "Anonymous"}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    {gift.collectorName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    +₹{gift.amount?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {new Date(gift.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Bag Performance & Team Status
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Bag #
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Collector
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Collected
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.batchStats.map((batch) => (
                  <tr
                    key={batch.batchId}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                        #{batch.bagNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {batch.collectorName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {batch.giftCount} items sealed
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {batch.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Idle
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        ₹ {batch.totalAmount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.batchStats.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              No bags have been opened yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
