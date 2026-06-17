import prisma from "@/db/lib/prisma";
import { auth } from "app/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import InviteMemberForm from "@/components/ui/InviteMemberForm";
import BatchList from "@/components/ui/BatchList";
import LiveMonitor from "@/components/ui/LiveMonitor";
import LogoutButton from "@/components/ui/LogoutButton";
import ConversationalAudit from "@/components/ui/ConversationalAudit";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function getEvent({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const event = await prisma.events.findUnique({
    where: { id },
    include: {
      Subevents: {
        orderBy: { Date: "asc" },
        include: {
          Batches: {
            orderBy: { bagNumber: "desc" },
            include: { _count: { select: { Gifts: true } } },
          },
        },
      },
    },
  });

  if (!event) return notFound();
  if (event.userId !== session.user.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {event.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Event ID: {event.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-semibold">
              Active
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <InviteMemberForm eventId={event.id} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Bag Management
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Open new collection bags and share QR codes with your team.
              </p>
            </div>
          </div>
          <BatchList subEvents={event.Subevents} />
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Command Center
            </h2>
            <Link
              href={`/dashboard/event/${event.id}/reconcile`}
              className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm group"
            >
              <svg
                className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Open Audit & Recon Page
            </Link>
          </div>

          <LiveMonitor eventId={event.id} />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Audit Engine</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Scan all bags for duplicates and resolve issues conversationally.
            </p>
          </div>
          <ConversationalAudit eventId={event.id} />
        </section>
      </div>
    </div>
  );
}
