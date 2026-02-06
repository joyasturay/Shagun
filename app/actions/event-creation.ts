"use server";

import prisma from "@/db/lib/prisma";
import { auth } from "../lib/auth";
import { revalidatePath } from "next/cache";
import { APP_CONFIG } from "../lib/config";
import { eventSchema } from "../lib/validation";
type ActionState = {
  error?: string;
  success?: string;
};

export async function createEvent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "NOT_AUTHENTICATED" };
    }
    const recentEvent = await prisma.events.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (recentEvent) {
      const timeSinceLast = Date.now() - recentEvent.createdAt.getTime();
      if (timeSinceLast < APP_CONFIG.RATE_LIMIT_INTERVAL_MS) {
        return {
          error: "Please wait a few seconds before creating another event.",
        };
      }
    }

    const activeEvents = await prisma.events.count({
      where: { userId: session.user.id },
    });
    if (activeEvents >= APP_CONFIG.MAX_EVENTS_PER_USER) {
      return {
        error: `Limit reached! You can only manage ${APP_CONFIG.MAX_EVENTS_PER_USER} event at a time.`,
      };
    }
    const eventName = formData.get("eventName");
    const subEvents = formData.getAll("subEvents");

    if (!eventName || typeof eventName !== "string") {
      return { error: "EVENT_NAME_MISSING" };
    }

    if (!subEvents.length) {
      return { error: "NO_SUBEVENTS_PROVIDED" };
    }
    const parsedSubEvents = subEvents.map((e, i) => {
      const parsed = JSON.parse(e as string);

      if (!parsed.name || !parsed.date) {
        throw new Error(`INVALID_SUBEVENT_${i}`);
      }

      return {
        name: parsed.name,
        Date: parsed.date, 
      };
    });
    const validation = eventSchema.safeParse({ eventName, subEvents: parsedSubEvents, });
    if (!validation.success) {
      return {
        error: validation.error.issues[0].message,
      };
    }
    const subEventData = parsedSubEvents.map((e) => ({
      name: e.name,
      Date: new Date(e.Date),
    }));

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
        data: { role: "ADMIN" },
      });
    });

    revalidatePath("/dashboard");
    return { success: "true" };
  } catch (err) {
    console.error("CREATE EVENT FAILED:", err);
    return { error: "EVENT_CREATION_FAILED" };
  }
}
