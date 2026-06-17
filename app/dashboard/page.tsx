import { auth } from "../lib/auth";
import prisma from "@/db/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardLoading from "./loading";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enterprise Top Navigation/Header Area */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate tracking-tight">
              Command Center
            </h2>
            <p className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 text-sm text-slate-500">
              Manage your event ledgers, teams, and digital Shagun collections.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/dashboard/new"
              className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Initialize Event
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Suspense fallback={<DashboardLoading />}>
          <EventComponent userId={session.user.id} />
        </Suspense>
      </div>
    </div>
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

  return (
    <div>
      {events.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
          <div className="mx-auto h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Ledgers Active</h3>
          <p className="text-slate-500 mt-2 mb-8 max-w-md mx-auto">
            You have not created or been assigned to any wedding events yet. Initialize your first event to start tracking.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex text-black font-semibold hover:underline transition-colors"
          >
            Create your first event <span aria-hidden="true" className="ml-1">&rarr;</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => {
          const isAdmin = event.userId === userId;

          return (
            <Link
              key={event.id}
              href={`/dashboard/event/${event.id}`}
              className="group block outline-none"
            >
              <div className="relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full z-10">
                
                <div className="absolute top-0 left-0 w-full h-1.5 bg-black" />

                <div className="flex justify-between items-start mb-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border bg-slate-100 text-slate-700 border-slate-200">
                    {isAdmin ? (
                      <><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg> Admin</>
                    ) : (
                      <><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Collector</>
                    )}
                  </span>
                  
                  {/* Subtle arrow that animates on hover */}
                  <div className="text-slate-400 group-hover:text-slate-900 transform group-hover:translate-x-1 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-5 truncate group-hover:text-black transition-colors">
                  {event.name}
                </h3>

                <div className="flex-1 mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Scheduled Ceremonies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.Subevents.map((sub, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        <svg className="w-3 h-3 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {sub.name}
                        <span className="ml-2 pl-2 border-l border-slate-300 text-slate-500 font-normal">
                          {new Date(sub.Date).toLocaleDateString('en-IN', {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                    ))}
                    {event.Subevents.length === 0 && (
                      <span className="text-sm text-slate-400 italic flex items-center">
                        No ceremonies configured
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-auto flex justify-between items-center text-sm font-medium text-slate-600 bg-slate-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                  <span className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                       {/* Decorative fake avatars to look like an enterprise team */}
                       <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700">A</div>
                       <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700">C</div>
                    </div>
                    <span>{event._count.collectors} Team {event._count.collectors === 1 ? 'Member' : 'Members'}</span>
                  </span>
                  <span className="text-black font-semibold text-sm group-hover:underline">
                    Access Ledger
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}