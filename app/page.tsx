import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { BrandNav } from "@/components/ui/brand-nav";

function HeroMockup() {
  const gifts = [
    { sender: "Sharma Family", amount: 5001, time: "11:42 PM", status: "verified" as const },
    { sender: "Gupta Uncle", amount: 2100, time: "11:38 PM", status: "verified" as const },
    { sender: "Mehta Aunty", amount: 1100, time: "11:35 PM", status: "pending" as const },
    { sender: "Anonymous", amount: 501, time: "11:31 PM", status: "new" as const },
    { sender: "Patel Family", amount: 2500, time: "11:28 PM", status: "verified" as const },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] bg-forest-depths">
      {/* Mock browser chrome */}
      <div className="flex items-center gap-2 border-b border-snow-white/10 px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-snow-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-snow-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-snow-white/20" />
        </div>
        <span className="mx-auto font-mono text-[11px] text-snow-white/40">
          shagun.ai/dashboard
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Event header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-snow-white/50">
              Live event
            </p>
            <p className="mt-1 text-lg font-light text-snow-white">
              Sharma–Verma Wedding
            </p>
          </div>
          <span className="rounded-full bg-lime-pulse px-2.5 py-1 text-[11px] font-medium text-forest-depths">
            ● Live
          </span>
        </div>

        {/* Stats row */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: "Collected", value: "₹1.2L" },
            { label: "Envelopes", value: "847" },
            { label: "Bags open", value: "3" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-snow-white/10 px-3 py-3"
            >
              <p className="text-[10px] uppercase tracking-wide text-snow-white/50">
                {s.label}
              </p>
              <p className="mt-1 font-mono text-base font-medium text-snow-white">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Gift feed */}
        <div className="rounded-2xl border border-snow-white/10 bg-snow-white/5">
          <div className="border-b border-snow-white/10 px-4 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-snow-white/50">
              Latest envelopes · Batch #12
            </p>
          </div>
          <div className="divide-y divide-snow-white/10">
            {gifts.map((g) => (
              <div key={g.sender} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-snow-white">{g.sender}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-snow-white/40">
                    {g.time}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-snow-white">
                    ₹{g.amount.toLocaleString("en-IN")}
                  </span>
                  {g.status === "new" && (
                    <span className="rounded-full bg-lime-pulse px-2 py-0.5 text-[10px] font-medium text-forest-depths">
                      New
                    </span>
                  )}
                  {g.status === "pending" && (
                    <span className="rounded-full border border-snow-white/30 px-2 py-0.5 text-[10px] text-snow-white/70">
                      Pending
                    </span>
                  )}
                  {g.status === "verified" && (
                    <span className="text-[10px] text-eucalyptus">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    step: "01",
    title: "Snap the envelope",
    body: "Collectors open a link on any phone, photograph each envelope, and it's instantly stored with a permanent visual record.",
  },
  {
    step: "02",
    title: "AI reads the handwriting",
    body: "Gemini Vision extracts sender and amount from messy handwriting in under 3 seconds. Edit anything it misses.",
  },
  {
    step: "03",
    title: "Reconcile in the morning",
    body: "AI flags duplicates and gaps. Chat with the audit engine to resolve issues. Export a perfect CSV for the family accountant.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-snow-white text-forest-depths">
      <BrandNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle botanical line art */}
        <svg
          className="pointer-events-none absolute -right-32 top-20 hidden h-[500px] w-[500px] opacity-[0.07] lg:block"
          viewBox="0 0 400 400"
          fill="none"
          aria-hidden
        >
          <path
            d="M200 380 C200 280 120 240 80 160 C40 80 120 20 200 60 C280 20 360 80 320 160 C280 240 200 280 200 380Z"
            stroke="#1c3a13"
            strokeWidth="1"
          />
          <path
            d="M200 60 V200 M200 200 C160 220 120 200 100 160 M200 200 C240 220 280 200 300 160"
            stroke="#1c3a13"
            strokeWidth="1"
          />
        </svg>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-frosted-glass bg-warm-stone px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-pulse" />
              <span className="text-xs text-pewter">
                Built for Indian weddings
              </span>
            </div>

            <h1 className="text-[clamp(2.5rem,5vw,3.75rem)] font-light leading-[1.08] tracking-[-0.02em] text-forest-depths">
              Every rupee.
              <br />
              Every guest.
              <br />
              Accounted for.
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-pewter">
              Replace the chaotic notebook and 3 AM Excel sheets. Collect, scan,
              and reconcile every shagun envelope — with a photo audit trail your
              whole family can trust.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Create your event
              </Link>
              <Link href="/login" className="btn-inverted">
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 border-t border-frosted-glass pt-8">
              {[
                { n: "10,000+", l: "Envelopes scanned" },
                { n: "< 3s", l: "Per AI read" },
                { n: "100%", l: "Audit trail" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-mono text-xl font-medium text-forest-depths">
                    {s.n}
                  </p>
                  <p className="mt-0.5 text-xs text-pewter">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-frosted-glass bg-warm-stone py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-widest text-pewter">
            How it works
          </p>
          <h2 className="mt-3 max-w-md text-3xl font-light tracking-tight text-forest-depths md:text-4xl">
            Three steps. Zero chaos.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <article
                key={s.step}
                className="rounded-2xl bg-snow-white p-8"
              >
                <span className="font-mono text-xs tracking-widest text-pewter">
                  {s.step}
                </span>
                <h3 className="mt-4 text-xl font-light text-forest-depths">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-pewter">
                  {s.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features dark band */}
      <section id="features" className="bg-forest-depths py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-snow-white/50">
                Why Shagun.ai
              </p>
              <h2 className="mt-3 text-3xl font-light tracking-tight text-snow-white md:text-4xl">
                The whole family deserves better than Excel.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-snow-white/65">
                Set up in 2 minutes. Share collector links. Watch envelopes flow
                in all night — then reconcile with AI before breakfast.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex rounded-full bg-snow-white px-6 py-3.5 text-sm font-medium text-forest-depths transition-colors hover:bg-warm-stone"
              >
                Get started free →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { t: "Photo audit trail", d: "Every envelope photographed and timestamped" },
                { t: "Batch sealing", d: "Physical bags mapped to digital batches" },
                { t: "AI reconciliation", d: "Duplicates and gaps caught automatically" },
                { t: "CSV export", d: "Accountant-ready in one click" },
              ].map((f) => (
                <div
                  key={f.t}
                  className="rounded-2xl border border-snow-white/15 p-5"
                >
                  <p className="text-sm font-medium text-snow-white">{f.t}</p>
                  <p className="mt-2 text-xs leading-relaxed text-snow-white/55">
                    {f.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-3xl font-light tracking-tight text-forest-depths md:text-4xl">
            Ditch the diary. Digitize the Shagun.
          </h2>
          <p className="mt-4 text-base text-pewter">
            Collector snaps. Admin reconciles. Family sleeps easy.
          </p>
          <Link href="/signup" className="btn-primary mt-8">
            Create your event — it&apos;s free
          </Link>
        </div>
      </section>

      <footer className="border-t border-frosted-glass py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-pewter md:flex-row lg:px-8">
          <BrandLogo href="/" />
          <span>© {new Date().getFullYear()} Shagun.ai</span>
        </div>
      </footer>
    </div>
  );
}
