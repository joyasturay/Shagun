"use server";
import { auth } from "../lib/auth";
import prisma from "@/db/lib/prisma";
import { giftSchema } from "../lib/validation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function createGift(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const rawData = {
    amount: formData.get("amount"),

    sender: formData.get("sender")?.toString() || undefined,

    note: formData.get("note")?.toString() || undefined,

    batchId: formData.get("batchId")?.toString() || "",

    imageUrl: formData.get("imageUrl")?.toString() || "",
  };

  const validation = giftSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }
  const { amount, sender, note, batchId,imageUrl } = validation.data;
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      event: {
        include: {
          events: {
            include: {
              collectors: true,
            },
          },
        },
      },
    },
  });
  if (!batch) return { error: "This batch does not exist" };
  if (batch.isSealed) return { error: "This batch already sealed" };
  const isAuthorised =
    batch.event.events.userId === session.user.id ||
    batch.event.events.collectors.some((c) => c.id === session.user.id);
  if (!isAuthorised) return { error: "Not authorised to access this event." };
  try {
    await prisma.gift.create({
      data: {
        batchId,
        imageUrl:validation.data.imageUrl || "",
        status: "UNPROCESSED",
        amount,
        sender,
        note,
        
      },
    });
    revalidatePath(`/collect/${batchId}`);
    return { success: "Saved!" };
  } catch (err) {
    console.log(err);
    return { error: "Error adding gift" };
  }
}
