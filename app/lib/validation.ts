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

export const giftSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least ₹1"),
  sender: z.string().optional(),
  note: z.string().max(100, "Note is too long").optional(),
  batchId: z.string().cuid("Invalid Batch ID"),
});
