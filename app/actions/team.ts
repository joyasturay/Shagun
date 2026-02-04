"use server";
import { auth } from "../lib/auth";
import prisma from "@/db/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
const formSchema = z.object({
  email: z.string().email(),
  eventId: z.string(),
});
export async function addTeamMembers(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized access." };
  }
  const eventId = formData.get("eventId") as string;
  const email = formData.get("email") as string;

  const checkData = formSchema.safeParse({ eventId, email });
  if (!checkData.success) {
    return { error: "Invalid inputs" };
  }
  const event = await prisma.events.findUnique({
    where: { id: checkData.data.eventId },
  });
  if (event?.userId != session?.user?.id) {
    return { error: "You do not have permission to modify this event." };
  }
  const userToInvite = await prisma.user.findUnique({
    where: { email:checkData.data.email},
  });
  if (!userToInvite) {
    return { error: "User not found. Ask them to sign up first!" };
  }
  if (session?.user?.id === userToInvite.id) {
    return { error: "You are already the admin!" };
  }
  try {
    await prisma.events.update({
      where: { id: eventId },
      data: {
        collectors: {
          connect: { id: userToInvite.id },
        },
      },
    });
    revalidatePath(`/dashboard/event/${eventId}`);
    return { success: "Team member added!" };
  } catch (err) {
    return { error: "Error occurred.Please try again" };
  }
}
