"use server";
import { auth } from "../lib/auth";
import prisma from "@/db/lib/prisma";
import { revalidatePath } from "next/cache";
export async function createBatch(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not logged in" };
  }
  const event = await prisma.subevents.findUnique({
    where: { id: eventId },
    include: {
      events: {
        include: {
          collectors: {
            select: { id: true },
          },
        },
      },
    },
  });
  if (!event) {
    return { error: "Ceremony not found" };
  }

  const isOwner = event.events.userId === session.user.id;
  const isCollector = event.events.collectors.some(
    (c) => c.id === session.user.id,
  );
  if (!isOwner && !isCollector) {
    return { error: "You don't have permission for this event." };
  }
  try {
    const lastBatch = await prisma.batch.findFirst({
      where: { eventId: eventId },
      orderBy: { bagNumber: "desc" },
      select: { bagNumber: true },
    });
    const nextBagNumber = (lastBatch?.bagNumber || 0) + 1;
    const newBatch = await prisma.batch.create({
      data: {
        bagNumber: nextBagNumber,
        capacity: 30,
        userId: session.user.id,
        eventId: eventId,
        isSealed: false,
      },
    });
    revalidatePath(`/dashboard/event/${eventId}`);
    return { success: true, batchNumber: newBatch.bagNumber };
  } catch (err) {
    console.log(err);
    return { error: "Failed to create batch" };
  }
}
