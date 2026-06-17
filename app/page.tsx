import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans antialiased selection:bg-amber-400/30">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
              <span className="text-[#09090b] font-black text-sm leading-none">S</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              Shagun<span className="text-amber-400">.ai</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Log in
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold bg-amber-400 text-[#09090b] rounded-lg hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-28 px-6 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-rose-600/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/8 text-amber-300 text-xs font-medium mb-10 tracking-wide">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            Built for Indian weddings
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8">
            <span className="text-white">Every rupee.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
              Every guest.
            </span>
            <br />
            <span className="text-white">Accounted for.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-12">
            Replace the chaotic notebook and 3 AM Excel sheets. Shagun.ai lets your family collect, scan, and reconcile every shagun envelope — in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-400 text-[#09090b] font-bold rounded-xl hover:bg-amber-300 transition-all shadow-2xl shadow-amber-400/25 text-base">
              Create your event
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center px-7 py-3.5 border border-white/10 text-zinc-300 font-medium rounded-xl hover:bg-white/5 hover:text-white transition-all text-base">
              Sign in to dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-2xl mx-auto mt-20 grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[
            { value: "10,000+", label: "Envelopes scanned" },
            { value: "< 3s", label: "AI reads per envelope" },
            { value: "100%", label: "Audit accuracy" },
          ].map((s) => (
            <div key={s.label} className="bg-[#09090b] py-6 text-center">
              <p className="text-2xl font-black text-amber-400 tabular-nums">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-1 tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bento features */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">How it works</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Three steps.<br className="hidden md:block" /> Zero chaos.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — tall */}
          <div className="md:row-span-2 bg-[#111113] border border-white/6 rounded-2xl p-7 flex flex-col justify-between min-h-[280px] md:min-h-[400px] group hover:border-amber-400/20 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6 group-hover:bg-amber-400/15 transition-colors">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Step 01</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-3">Snap the envelope</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Hand your collector a link. They open it on any phone, snap a photo of each envelope, and it's instantly stored. No app download, no login needed for them.
              </p>
            </div>
            <div className="mt-8 h-24 rounded-xl bg-gradient-to-br from-amber-400/10 to-orange-600/5 border border-amber-400/10 flex items-center justify-center">
              <span className="text-4xl">📸</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="md:col-span-2 bg-[#111113] border border-white/6 rounded-2xl p-7 group hover:border-violet-400/20 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center mb-6 group-hover:bg-violet-400/15 transition-colors">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Step 02</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">AI reads the handwriting</h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Gemini Vision extracts the sender name and amount from even the messiest handwriting in under 3 seconds. Edit anything it misses with one tap.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111113] border border-white/6 rounded-2xl p-7 group hover:border-emerald-400/20 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-6 group-hover:bg-emerald-400/15 transition-colors">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Step 03</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Audit in the morning</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              AI flags duplicates, typos, and missing entries. Chat with it conversationally to resolve issues.
            </p>
          </div>

          {/* Card 4 — wide */}
          <div className="bg-[#111113] border border-white/6 rounded-2xl p-7 group hover:border-rose-400/20 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mb-6 group-hover:bg-rose-400/15 transition-colors">
              <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Bonus</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Export & reconcile</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Hand the family accountant a perfect CSV. Every bag, every rupee, every guest — fully traceable.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="relative rounded-3xl overflow-hidden border border-white/8 bg-gradient-to-br from-[#1a1305] via-[#111113] to-[#09090b] p-14 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.12)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(251,146,60,0.06)_0%,_transparent_60%)] pointer-events-none" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400/60 mb-4">Get started free</p>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              The whole family<br />deserves better than Excel.
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto mb-10 leading-relaxed">
              Set up your event in 2 minutes. Distribute collector links. Sit back while shagun data flows in — all night, all wedding.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-[#09090b] font-black rounded-xl hover:bg-amber-300 transition-all shadow-2xl shadow-amber-400/20 text-base">
              Create your event — it's free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-400 flex items-center justify-center">
              <span className="text-[#09090b] font-black text-[10px]">S</span>
            </div>
            <span>© {new Date().getFullYear()} Shagun.ai</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
