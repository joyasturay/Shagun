import Link from "next/link";

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

export default function CollectorBagList({
  subEvents,
}: {
  subEvents: SubeventWithBatches[];
}) {
  const totalBags = subEvents.reduce((sum, s) => sum + s.Batches.length, 0);

  if (totalBags === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 text-sm">
          No bags have been opened yet. Check back once the admin opens one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subEvents.map((sub) => {
        if (sub.Batches.length === 0) return null;
        return (
          <div
            key={sub.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{sub.name}</h3>
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

            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sub.Batches.map((batch) =>
                batch.isSealed ? (
                  <div
                    key={batch.id}
                    className="relative p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-300" />
                    <div className="flex items-start justify-between mt-1">
                      <span className="text-2xl font-bold text-slate-500">#{batch.bagNumber}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-200 text-slate-600">
                        Sealed
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-500">{batch._count.Gifts}</span>
                      <span className="text-xs text-slate-400 font-medium">items</span>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={batch.id}
                    href={`/collect/${batch.id}`}
                    className="group relative p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                    <div className="flex items-start justify-between mt-1">
                      <span className="text-2xl font-bold text-slate-900">#{batch.bagNumber}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-700">{batch._count.Gifts}</span>
                      <span className="text-xs text-slate-500 font-medium">items</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                      Start scanning
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
