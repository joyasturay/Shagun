"use server";
import prisma from "@/db/lib/prisma";
import { auth } from "../lib/auth";
export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session || !session?.user) {
    return { error: "Not Valid user" };
  }
  const eventName = formData.get("eventName") as string;
  const rawSubEvents = formData.getAll("subEvents") as string[];

  const subEvents = rawSubEvents.map((item) => JSON.parse(item)) as {
    name: string;
    date: string;
  }[];
    const subEventData = subEvents.map((s) => ({
      name: s.name,
      Date: new Date(s.date), 
    }));
  try {
    await prisma.events.create({
      data: {
        name: eventName,
        createdAt: new Date(),
        Subevents: {
          createMany: {
                data: subEventData,
          },
        },
        userId: session?.user?.id,
      },
    });
      return {success:"Event created successfully"}
  } catch (err) {
    console.log(err);
    return { error: "Error occurred while creating event.Please try again" };
  }
}
