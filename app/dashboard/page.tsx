import { auth } from "../lib/auth";
import prisma from "@/db/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Fetch Events
  const events = await prisma.events.findMany({
    where: { 
      OR: [
        { userId: session.user.id }, // Updated to match your new Schema (creatorId)
        { collectors: { some: { id: session.user.id } } }
      ]
    },
    include: {
      Subevents: {
        orderBy: { Date: 'asc' }, // Fetch ALL subevents, ordered by date
        select: { name: true, Date: true }
      },
      _count: {
        select: { collectors: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Render
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Weddings</h1>
          <p className="text-gray-500 mt-1">Manage events and track collections</p>
        </div>
        <Link 
          href="/dashboard/new" 
          className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          + Create New Event
        </Link>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <h3 className="text-xl font-semibold text-gray-900">No events found</h3>
          <p className="text-gray-500 mt-2 mb-6">You have not created or joined any weddings yet.</p>
          <Link 
            href="/dashboard/new" 
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first event &rarr;
          </Link>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const isAdmin = event.userId === session.user.id;

          return (
            <Link 
              key={event.id} 
              href={`/dashboard/event/${event.id}`}
              className="group block"
            >
              <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-gray-200 hover:border-gray-300 h-full flex flex-col">
                
                {/* Role Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    isAdmin 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {isAdmin ? "ADMIN" : "TEAM MEMBER"}
                  </span>
                </div>

                {/* Event Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 truncate">
                  {event.name}
                </h3>
                
                {/* Sub-events List (Tags) */}
                <div className="flex-1 mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Ceremonies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.Subevents.map((sub, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {sub.name}
                        <span className="ml-1.5 text-xs text-gray-500 border-l pl-1 border-gray-300">
                          {new Date(sub.Date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                    ))}
                    {event.Subevents.length === 0 && (
                      <span className="text-sm text-gray-400 italic">No ceremonies added</span>
                    )}
                  </div>
                </div>

                {/* Footer: Member Count */}
                <div className="border-t pt-4 mt-auto flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    👥 {event._count.collectors} Team Members
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform text-black">
                    View &rarr;
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