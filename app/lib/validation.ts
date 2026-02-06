import { z } from "zod";

export const eventSchema = z.object({
  eventName: z
    .string()
    .min(2, "Event name too short")
    .regex(/[a-zA-Z]/, "Must contain letters"),
  subEvents: z
    .array(
      z.object({
        name: z
          .string()
          .min(2, "Ceremony name is too short")
          .regex(/[a-zA-Z]/, "Must contain letters"),
        Date: z.coerce.date({
          error: "Invalid date",
        }),
      }),
    )
    .min(1, "You need at least one ceremony to start."),
});
