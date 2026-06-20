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

// The AI only ever chooses FINDING INDICES. It never returns raw gift IDs —
// the server resolves gift IDs from the trusted report, so the AI cannot
// accidentally reach across other findings that share the same name.
type AIDecision =
  | { action: "DELETE"; findingIndices: number[]; reply: string }
  | { action: "RENAME"; renames: { findingIndex: number; newName: string }[]; reply: string }
  | { action: "DISMISS"; findingIndices: number[]; reply: string }
  | { action: "REPLY_ONLY"; reply: string };

type ChatResult =
  | {
      success: true;
      reply: string;
      action?: "DELETE" | "RENAME" | "DISMISS";
      deletedGiftIds?: string[];
      renamedGiftIds?: string[];
      resolvedFindingIndices?: number[];
    }
  | { success: false; error: string };

export async function chatWithAudit(
  userMessage: string,
  history: ChatMessage[],
  report: AuditReport,
  activeFinding: Finding | null,
  eventId: string
): Promise<ChatResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const event = await prisma.events.findUnique({ where: { id: eventId }, select: { userId: true } });
    if (!event || event.userId !== session.user.id) return { success: false, error: "Access denied" };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const selectedIdx = activeFinding ? report.findings.indexOf(activeFinding) : -1;

    const systemContext = `You are a smart, friendly AI assistant helping an Indian wedding organizer review their gift ledger audit. You understand natural, conversational Hindi-English (Hinglish) instructions.

ALL FINDINGS (refer to each by its index number #):
${report.findings
  .map(
    (f, i) =>
      `[#${i}] ${f.type} | name: "${f.namesInvolved}" | ${f.amounts.map((a) => `₹${a}`).join(", ") || "no amount"} | Bag${(f.bagNumbers?.length ?? 0) > 1 ? "s" : ""} ${f.bagNumbers?.map((b) => `#${b}`).join(", ") || "?"} | ${f.giftIds.length} entries`
  )
  .join("\n")}

${selectedIdx >= 0 ? `>>> The user has CLICKED on and SELECTED finding [#${selectedIdx}] ("${activeFinding!.namesInvolved}", ${activeFinding!.amounts.map((a) => `₹${a}`).join(", ")}). <<<` : ">>> Nothing is selected. The user is speaking generally. <<<"}

CONVERSATION HISTORY:
${history.map((m) => `${m.role === "user" ? "User" : "You"}: ${m.content}`).join("\n")}

User just said: "${userMessage}"

CRITICAL SCOPE RULES — decide WHICH findings to act on:
- "this", "this one", "selected", "this person", "isko", "yeh wala", "the selected" → act ONLY on the selected finding [#${selectedIdx}]. Do NOT touch other findings even if they share the same name.
- "all", "sab", "all the gupta jis", "everyone named X", "every X" → act on ALL findings whose name matches X.
- "the ₹200 one", "bag #2 wala", "the third one" → act on the specific finding matching that description.
- If the instruction is vague AND a finding is selected → default to ONLY the selected finding [#${selectedIdx}].
- If vague AND nothing is selected → use REPLY_ONLY and ask which one.

IMPORTANT: Multiple findings may share the same name (e.g. several "gupta ji" findings at different amounts). Selecting one and saying "rename this" must affect ONLY that one finding index, NOT all the gupta jis. Only act on multiple findings when the user explicitly says "all" or names a group.

ACTIONS — pick exactly one and execute fully WITHOUT asking follow-ups (unless truly ambiguous):
- DELETE → remove the duplicate entries in the chosen findings (server keeps the first entry, deletes the rest). Provide findingIndices.
- RENAME → rename entries. Provide a renames array of {findingIndex, newName}. For a single finding renamed to one name, that's one entry. For "number them gupta 1, 2, 3", provide one entry per finding with sequential names in the order they appear above.
- DISMISS → entries are valid, no action needed. Provide findingIndices.
- REPLY_ONLY → answering a question, or genuinely cannot tell which finding(s) they mean.

Rules:
- Be warm, brief, conversational. Max 2 sentences.
- DELETE: say how many duplicates you removed.
- RENAME: confirm the new name(s) and which finding(s).
- Use ONLY finding index numbers shown above. Never invent indices.

Return ONLY valid JSON (no markdown):
{
  "action": "DELETE" | "RENAME" | "DISMISS" | "REPLY_ONLY",
  "findingIndices": [0],
  "renames": [{"findingIndex": 0, "newName": "Gupta Ji 1"}],
  "reply": "Your reply here"
}`;

    const result = await model.generateContent(systemContext);
    const decision: AIDecision = JSON.parse(result.response.text());

    // Resolve gift IDs ONLY from the server-trusted report, by finding index.
    const giftIdsForFinding = (idx: number): string[] => {
      const f = report.findings[idx];
      return f ? f.giftIds : [];
    };

    // Defence-in-depth: only act on gifts that belong to this event.
    const verifyGiftIds = async (ids: string[]): Promise<string[]> => {
      if (ids.length === 0) return [];
      const gifts = await prisma.gift.findMany({
        where: { id: { in: ids }, batch: { event: { eventId } } },
        select: { id: true },
      });
      return gifts.map((g) => g.id);
    };

    if (decision.action === "DELETE" && decision.findingIndices?.length > 0) {
      const validIndices = decision.findingIndices.filter((i) => i >= 0 && i < report.findings.length);
      // Keep the first entry in each finding, delete the rest (the duplicates).
      const idsToDelete = validIndices.flatMap((i) => giftIdsForFinding(i).slice(1));
      const safeIds = await verifyGiftIds(idsToDelete);
      if (safeIds.length > 0) {
        await prisma.gift.deleteMany({ where: { id: { in: safeIds } } });
      }
      return {
        success: true,
        reply: decision.reply,
        action: "DELETE",
        deletedGiftIds: safeIds,
        resolvedFindingIndices: validIndices,
      };
    }

    if (decision.action === "RENAME" && decision.renames?.length > 0) {
      const allRenamedIds: string[] = [];
      const resolved: number[] = [];
      await Promise.all(
        decision.renames.map(async ({ findingIndex, newName }) => {
          if (findingIndex < 0 || findingIndex >= report.findings.length) return;
          if (!newName?.trim()) return;
          const safeIds = await verifyGiftIds(giftIdsForFinding(findingIndex));
          if (safeIds.length > 0) {
            await prisma.gift.updateMany({
              where: { id: { in: safeIds } },
              data: { sender: newName.trim() },
            });
            allRenamedIds.push(...safeIds);
            resolved.push(findingIndex);
          }
        })
      );
      return {
        success: true,
        reply: decision.reply,
        action: "RENAME",
        renamedGiftIds: allRenamedIds,
        resolvedFindingIndices: resolved,
      };
    }

    if (decision.action === "DISMISS" && decision.findingIndices?.length > 0) {
      const validIndices = decision.findingIndices.filter((i) => i >= 0 && i < report.findings.length);
      return {
        success: true,
        reply: decision.reply,
        action: "DISMISS",
        resolvedFindingIndices: validIndices,
      };
    }

    return { success: true, reply: decision.reply };
  } catch (error) {
    console.error("Chat failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
