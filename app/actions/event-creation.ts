"use server";

import prisma from "@/db/lib/prisma";
import { auth } from "../lib/auth";
import { revalidatePath } from "next/cache";

type ActionState = {
  error?: string;
  success?: string;
};

export async function createEvent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "NOT_AUTHENTICATED" };
    }

    const eventName = formData.get("eventName");
    const rawEvents = formData.getAll("subEvents");

    if (!eventName || typeof eventName !== "string") {
      return { error: "EVENT_NAME_MISSING" };
    }

    if (!rawEvents.length) {
      return { error: "NO_SUBEVENTS_PROVIDED" };
    }

    const subEventData = rawEvents.map((e, i) => {
      const parsed = JSON.parse(e as string);
      if (!parsed.name || !parsed.date) {
        throw new Error(`INVALID_SUBEVENT_${i}`);
      }
      return {
        name: parsed.name,
        Date: new Date(parsed.date),
      };
    });

    await prisma.$transaction(async (tx) => {
      await tx.events.create({
        data: {
          name: eventName,
          userId: session.user.id,
          Subevents: {
            create: subEventData,
          },
        },
      });
      await tx.user.update({
        where: { id: session.user.id },
        data:{role:"ADMIN"}
      })
    });

    revalidatePath("/dashboard");
    return { success: "true"};
  } catch (err) {
    console.error("CREATE EVENT FAILED:", err);
    return { error: "EVENT_CREATION_FAILED" };
  }
}
