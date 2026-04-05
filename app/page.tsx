import Link from "next/link";
export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-900 font-sans selection:bg-rose-200">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-950 rounded-md flex items-center justify-center shadow-lg shadow-rose-900/20">
            <span className="text-amber-400 font-serif font-bold text-lg leading-none">
              S
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Shagun<span className="text-rose-900">.ai</span>
          </span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <Link
            href="/login"
            className="text-gray-600 hover:text-rose-900 transition"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="bg-rose-950 text-amber-50 px-5 py-2.5 rounded-full text-sm shadow-md hover:bg-rose-900 hover:shadow-lg transition-all active:scale-95"
          >
            Go to Dashboard
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 lg:pb-32 flex flex-col items-center text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold uppercase tracking-widest mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          The Modern Wedding Ledger
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-4xl leading-[1.1]">
          Ditch the diary. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-950 to-rose-700">
            Digitize the Shagun.
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
          The chaos of WhatsApp photos and 2 AM Excel sheets is over. Securely
          collect, auto-scan, and reconcile wedding envelopes in real-time.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="flex items-center justify-center bg-rose-950 text-amber-400 px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-rose-900/20 hover:bg-rose-900 hover:shadow-2xl transition-all active:scale-95"
          >
            Create Your Event
            <span className="ml-2">→</span>
          </Link>
        </div>
      </main>

      <section className="bg-white border-y border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-900 flex items-center justify-center rounded-xl text-2xl shadow-sm border border-rose-100">
                📸
              </div>
              <h3 className="text-xl font-bold text-gray-900">Snap & Stash</h3>
              <p className="text-gray-600 leading-relaxed">
                Hand the bag to your cousin. They snap a photo of the envelope
                and drop it in. Fast, secure, and does not hold up the stage
                line.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 flex items-center justify-center rounded-xl text-2xl shadow-sm border border-amber-100">
                ✨
              </div>
              <h3 className="text-xl font-bold text-gray-900">AI OCR Magic</h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by Gemini. Our AI instantly reads messy handwriting on
                envelopes to extract names and amounts, saving you hours of
                typing.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-50 text-green-700 flex items-center justify-center rounded-xl text-2xl shadow-sm border border-green-100">
                🔐
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Steel-Grade Audit
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The morning after, sit down with the physical cash and the app.
                Verify every envelope. Export a perfect CSV for the family
                accountant.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="bg-rose-950 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-900 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-900 rounded-full blur-3xl opacity-20"></div>

          <h2 className="text-3xl md:text-5xl font-bold text-white relative z-10">
            Ready to bring order to the chaos?
          </h2>
          <p className="text-rose-200 mt-6 max-w-2xl mx-auto text-lg relative z-10">
            Join the modern families who are securing their wedding registries
            with Shagun.ai.
          </p>
          <div className="mt-10 relative z-10">
            <Link
              href="/dashboard"
              className="inline-block bg-amber-400 text-rose-950 px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-amber-300 hover:scale-105 transition-all"
            >
              Enter Command Center
            </Link>
          </div>
        </div>
      </section>
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Shagun.ai. Built with steel.</p>
        <div className="flex gap-6">
          <span className="hover:text-gray-900 cursor-pointer transition">
            Privacy Policy
          </span>
          <span className="hover:text-gray-900 cursor-pointer transition">
            Terms of Service
          </span>
        </div>
      </footer>
    </div>
  );
}
