"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/db/lib/prisma";
import { auth } from "../lib/auth";
import type { AuditReport, Finding } from "./detect-anomalies";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AIDecision =
  | { action: "DELETE_GIFTS"; giftIds: string[]; reply: string }
  | { action: "RENAME_GIFT"; giftIds: string[]; newName: string; reply: string }
  | { action: "BULK_RENAME"; renames: { giftIds: string[]; newName: string }[]; reply: string }
  | { action: "DISMISS_FINDING"; reply: string }
  | { action: "REPLY_ONLY"; reply: string };

export async function chatWithAudit(
  userMessage: string,
  history: ChatMessage[],
  report: AuditReport,
  activeFinding: Finding | null,
  eventId: string
): Promise<{ success: true; reply: string; action?: "DELETE_GIFTS" | "RENAME_GIFT" | "BULK_RENAME" | "DISMISS_FINDING"; deletedGiftIds?: string[]; renamedGiftIds?: string[]; newName?: string; resolvedFindingIndices?: number[] } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const event = await prisma.events.findUnique({ where: { id: eventId }, select: { userId: true } });
    if (!event || event.userId !== session.user.id) return { success: false, error: "Access denied" };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const systemContext = `You are a smart, friendly AI assistant helping an Indian wedding organizer review their gift ledger audit. You understand natural, conversational Hindi-English (Hinglish) instructions.

ALL UNRESOLVED FINDINGS (each has a finding index and its exact Gift IDs):
${report.findings.map((f, i) => `[#${i}] ${f.type} | "${f.namesInvolved}" | ${f.amounts.map((a) => `₹${a}`).join(", ") || "no amount"} | Bag${(f.bagNumbers?.length ?? 0) > 1 ? "s" : ""} ${f.bagNumbers?.map((b) => `#${b}`).join(", ") || "?"} | IDs: ${f.giftIds.join(", ")}`).join("\n")}

${activeFinding ? `CURRENTLY SELECTED by user (they clicked on it): [#${report.findings.indexOf(activeFinding)}] "${activeFinding.namesInvolved}" — ${activeFinding.amounts.map((a) => `₹${a}`).join(", ")} | IDs: ${activeFinding.giftIds.join(", ")}` : "Nothing selected — user is speaking generally."}

CONVERSATION HISTORY:
${history.map((m) => `${m.role === "user" ? "User" : "You"}: ${m.content}`).join("\n")}

User just said: "${userMessage}"

SCOPE RULES (read the user's intent):
- "all", "sab", "all gupta jis", "everyone named X" → act on ALL findings that match
- "this", "selected", "this one", "yeh wala" → act only on the currently selected finding
- "the ₹200 one", "bag #2 wala" → act on the specific finding matching that description
- If unclear and something is selected, default to the selected finding
- If unclear and nothing is selected, ask for clarification (REPLY_ONLY)

YOUR JOB — pick exactly one action and execute it fully WITHOUT asking follow-up questions:

- DELETE_GIFTS → remove duplicates. Keep first gift ID in each finding, delete the rest. Return all IDs to delete.
- RENAME_GIFT → rename ALL matching entries to a SINGLE new name. Return all IDs and the one newName.
- BULK_RENAME → rename different groups to DIFFERENT names in one shot. Use when user says things like "gupta 1, 2, 3" or "number them". You decide which finding group gets which number — go in the order they appear in the findings list above. Return an array of renames.
- DISMISS_FINDING → entries are valid, no action needed.
- REPLY_ONLY → ONLY if genuinely ambiguous and you truly cannot infer intent. Do NOT use this just because it's complex — figure it out and act.

IMPORTANT: If user says "rename all gupta jis to gupta 1, 2, 3", use BULK_RENAME immediately — assign "Gupta Ji 1" to the first gupta finding's IDs, "Gupta Ji 2" to the second, etc. Don't ask which one is which.

Rules:
- Be warm, brief, conversational. Max 2 sentences.
- For DELETE: say how many duplicates you removed.
- For RENAME/BULK_RENAME: confirm what you renamed and how many.
- ONLY use Gift IDs from the findings list above. Never invent IDs.

Return ONLY valid JSON (no markdown):
{
  "action": "DELETE_GIFTS" | "RENAME_GIFT" | "BULK_RENAME" | "DISMISS_FINDING" | "REPLY_ONLY",
  "giftIds": ["id1"],
  "newName": "name (RENAME_GIFT only)",
  "renames": [{"giftIds": ["id1", "id2"], "newName": "Gupta Ji 1"}, {"giftIds": ["id3"], "newName": "Gupta Ji 2"}],
  "reply": "Your reply here"
}`;

    const result = await model.generateContent(systemContext);
    const decision: AIDecision = JSON.parse(result.response.text());

    // Verify gifts belong to this event (Batch -> Subevents.eventId = Events.id)
    const verifyGiftIds = async (ids: string[]): Promise<string[]> => {
      const gifts = await prisma.gift.findMany({
        where: { id: { in: ids }, batch: { event: { eventId } } },
        select: { id: true },
      });
      return gifts.map((g) => g.id);
    };

    // Find which findings are fully covered by the acted-on gift IDs
    const findResolvedIndices = (actedIds: Set<string>): number[] =>
      report.findings
        .map((f, i) => ({ f, i }))
        .filter(({ f }) => f.giftIds.every((id) => actedIds.has(id)) || f.giftIds.some((id) => actedIds.has(id)))
        .map(({ i }) => i);

    if (decision.action === "DELETE_GIFTS" && decision.giftIds?.length > 0) {
      const safeIds = await verifyGiftIds(decision.giftIds);
      if (safeIds.length > 0) {
        await prisma.gift.deleteMany({ where: { id: { in: safeIds } } });
      }
      const resolvedFindingIndices = findResolvedIndices(new Set(safeIds));
      return { success: true, reply: decision.reply, action: "DELETE_GIFTS", deletedGiftIds: safeIds, resolvedFindingIndices };
    }

    if (decision.action === "RENAME_GIFT" && decision.giftIds?.length > 0 && decision.newName) {
      const safeIds = await verifyGiftIds(decision.giftIds);
      if (safeIds.length > 0) {
        await prisma.gift.updateMany({
          where: { id: { in: safeIds } },
          data: { sender: decision.newName.trim() },
        });
      }
      const resolvedFindingIndices = findResolvedIndices(new Set(safeIds));
      return { success: true, reply: decision.reply, action: "RENAME_GIFT", renamedGiftIds: safeIds, newName: decision.newName.trim(), resolvedFindingIndices };
    }

    if (decision.action === "BULK_RENAME" && decision.renames?.length > 0) {
      const allRenamedIds: string[] = [];
      await Promise.all(
        decision.renames.map(async ({ giftIds, newName }) => {
          if (!giftIds?.length || !newName) return;
          const safeIds = await verifyGiftIds(giftIds);
          if (safeIds.length > 0) {
            await prisma.gift.updateMany({
              where: { id: { in: safeIds } },
              data: { sender: newName.trim() },
            });
            allRenamedIds.push(...safeIds);
          }
        })
      );
      const resolvedFindingIndices = findResolvedIndices(new Set(allRenamedIds));
      return { success: true, reply: decision.reply, action: "BULK_RENAME", renamedGiftIds: allRenamedIds, resolvedFindingIndices };
    }

    if (decision.action === "DISMISS_FINDING") {
      // Dismiss covers selected finding or all findings if nothing selected
      const resolvedFindingIndices = activeFinding
        ? [report.findings.indexOf(activeFinding)]
        : [];
      return { success: true, reply: decision.reply, action: "DISMISS_FINDING", resolvedFindingIndices };
    }

    return { success: true, reply: decision.reply };
  } catch (error) {
    console.error("Chat failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
