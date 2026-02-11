import prisma from "@/db/lib/prisma";
import { auth } from "app/lib/auth";
import { notFound, redirect } from "next/navigation";
import InviteMemberForm from "@/components/ui/InviteMemberForm";
import BatchList from "@/components/ui/BatchList";
import LiveMonitor from "@/components/ui/LiveMonitor";
type Props = {
  params: Promise<{ id: string }>;
};
export default async function getEvent({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const event = await prisma.events.findUnique({
    where: { id: id },
    include: {
      collectors: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      Subevents: {
        orderBy: { Date: "asc" },
        include: {
          Batches: {
            orderBy: { bagNumber: "desc" },
            include: {
              _count: { select: { Gifts: true } },
            },
          },
        },
      },
    },
  });
  if (!event) {
    return notFound();
  }
  if (event.userId != session?.user?.id) redirect("/dashboard");
  const isAdmin = event.userId;
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-gray-500">Event ID: {event.id}</p>
        </div>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Active
        </span>
      </div>
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">My Team</h2>

        {event.collectors.length === 0 ? (
          <p className="text-gray-500 italic">
            No team members yet. Invite someone!
          </p>
        ) : (
          <div className="space-y-3">
            {event.collectors.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{c.name || "Unknown Name"}</p>
                  <p className="text-sm text-gray-500">{c.email}</p>
                </div>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {c.role}
                </span>
              </div>
            ))}
          </div>
        )}
        <BatchList subEvents={event.Subevents} />
      </div>
      <InviteMemberForm eventId={event.id} />
      {isAdmin && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Command Center</h2>
          <LiveMonitor eventId={event.id} />
        </div>
      )}
    </div>
  );
}
