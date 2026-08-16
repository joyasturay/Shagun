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
      <div className="rounded-2xl border border-dashed border-frosted-glass bg-warm-stone py-16 text-center">
        <p className="text-[length:var(--text-caption)] text-pewter">
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
          <div key={sub.id} className="overflow-hidden rounded-2xl bg-warm-stone">
            <div className="flex items-center gap-3 border-b border-frosted-glass p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-snow-white text-forest-depths">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[length:var(--text-body-sm)] font-medium text-forest-depths">{sub.name}</h3>
                <p className="mt-0.5 text-[length:var(--text-label)] text-pewter">
                  {new Date(sub.Date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {sub.Batches.map((batch) =>
                batch.isSealed ? (
                  <div
                    key={batch.id}
                    className="rounded-2xl bg-snow-white/50 p-4 opacity-60"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-seed-sans-mono text-[length:var(--text-subheading)] font-medium text-pewter">
                        #{batch.bagNumber}
                      </span>
                      <span className="badge-outline text-[10px]">Sealed</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-seed-sans-mono text-[length:var(--text-body-sm)] text-pewter">
                        {batch._count.Gifts}
                      </span>
                      <span className="text-[length:var(--text-label)] text-pewter">items</span>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={batch.id}
                    href={`/collect/${batch.id}`}
                    className="group rounded-2xl bg-snow-white p-4 transition-colors hover:bg-frosted-glass/30"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-seed-sans-mono text-[length:var(--text-subheading)] font-medium tracking-[0.015em] text-forest-depths">
                        #{batch.bagNumber}
                      </span>
                      <span className="badge-lime text-[10px]">Active</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-seed-sans-mono text-[length:var(--text-body-sm)] font-medium text-forest-depths">
                        {batch._count.Gifts}
                      </span>
                      <span className="text-[length:var(--text-label)] text-pewter">items</span>
                    </div>
                    <div className="mt-2 text-[length:var(--text-label)] text-pewter group-hover:text-forest-depths">
                      Start scanning →
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
