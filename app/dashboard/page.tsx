import { auth } from "../lib/auth";
import prisma from "@/db/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardLoading from "./loading";
import { DashboardShell } from "@/components/ui/dashboard-shell";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="Command Center"
      subtitle="Manage your event ledgers, teams, and digital Shagun collections."
      action={
        <Link href="/dashboard/new" className="btn-primary">
          Initialize Event
        </Link>
      }
    >
      <Suspense fallback={<DashboardLoading />}>
        <EventComponent userId={session.user.id} />
      </Suspense>
    </DashboardShell>
  );
}

async function EventComponent({ userId }: { userId: string }) {
  const events = await prisma.events.findMany({
    where: {
      OR: [{ userId: userId }, { collectors: { some: { id: userId } } }],
    },
    include: {
      Subevents: {
        orderBy: { Date: "asc" },
        select: { name: true, Date: true },
      },
      _count: {
        select: { collectors: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-frosted-glass bg-warm-stone py-24 text-center">
        <span className="code-pill mx-auto mb-6">EVT-00</span>
        <h3 className="text-[length:var(--text-subheading)] font-light text-forest-depths">
          No ledgers active
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[length:var(--text-caption)] text-pewter">
          You have not created or been assigned to any wedding events yet. Initialize your first event to start tracking.
        </p>
        <Link href="/dashboard/new" className="btn-text mt-8 inline-flex">
          Create your first event →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => {
        const isAdmin = event.userId === userId;

        return (
          <Link
            key={event.id}
            href={`/dashboard/event/${event.id}`}
            className="group block outline-none"
          >
            <article className="flex h-full flex-col rounded-2xl bg-warm-stone p-6 transition-colors hover:bg-frosted-glass/40">
              <div className="mb-4 flex items-start justify-between">
                <span className={isAdmin ? "badge-outline" : "badge-lime"}>
                  {isAdmin ? "Admin" : "Collector"}
                </span>
                <span className="text-pewter transition-transform group-hover:translate-x-0.5 group-hover:text-forest-depths">
                  →
                </span>
              </div>

              <h3 className="mb-5 truncate text-[length:var(--text-subheading)] font-light leading-[var(--leading-subheading)] text-forest-depths">
                {event.name}
              </h3>

              <div className="mb-6 flex-1">
                <p className="section-label mb-3">Scheduled ceremonies</p>
                <div className="flex flex-wrap gap-2">
                  {event.Subevents.map((sub, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-snow-white px-3 py-1.5 text-[length:var(--text-label)] text-forest-depths"
                    >
                      {sub.name}
                      <span className="ml-2 border-l border-frosted-glass pl-2 text-pewter">
                        {new Date(sub.Date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                  ))}
                  {event.Subevents.length === 0 && (
                    <span className="text-[length:var(--text-caption)] italic text-pewter">
                      No ceremonies configured
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-frosted-glass pt-4 text-[length:var(--text-caption)] text-pewter">
                <span>
                  {event._count.collectors} team{" "}
                  {event._count.collectors === 1 ? "member" : "members"}
                </span>
                <span className="font-medium text-forest-depths group-hover:underline">
                  Access ledger →
                </span>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
