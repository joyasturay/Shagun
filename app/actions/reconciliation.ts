"use server";
import prisma from "@/db/lib/prisma";
import { revalidatePath } from "next/cache";
export async function verifyGift(
  giftId: string,
  status: "PROCESSED" | "FLAGGED",
  eventId: string,
)
{
  await prisma.gift.update({
    where: { id: giftId },
    data: { status },
  });
  revalidatePath(`/dashboard/event/${eventId}`);
}
