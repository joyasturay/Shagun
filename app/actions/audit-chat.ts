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

// scope decides WHICH findings get touched — resolved deterministically on the
// server, NOT chosen freely by the AI:
//   SELECTED       → exactly the finding the user clicked on (the safe default)
//   ALL_SAME_NAME  → every finding whose name matches the selected/named person
//   SPECIFIC       → an explicit list of finding indices (e.g. "number them 1,2,3")
type Scope = "SELECTED" | "ALL_SAME_NAME" | "SPECIFIC";

type AIDecision =
  | { action: "DELETE"; scope: Scope; targetIndices?: number[]; reply: string }
  | {
      action: "RENAME";
      scope: Scope;
      newName?: string;
      renames?: { findingIndex: number; newName: string }[];
      targetIndices?: number[];
      reply: string;
    }
  | { action: "DISMISS"; scope: Scope; targetIndices?: number[]; reply: string }
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

ALL FINDINGS (refer to each by its index #):
${report.findings
  .map(
    (f, i) =>
      `[#${i}] ${f.type} | name: "${f.namesInvolved}" | ${f.amounts.map((a) => `₹${a}`).join(", ") || "no amount"} | ${f.giftIds.length} entries`
  )
  .join("\n")}

${selectedIdx >= 0 ? `>>> The user has CLICKED and SELECTED finding [#${selectedIdx}] — name "${activeFinding!.namesInvolved}", ${activeFinding!.amounts.map((a) => `₹${a}`).join(", ")}, ${activeFinding!.giftIds.length} entries. <<<` : ">>> Nothing is selected. <<<"}

CONVERSATION HISTORY:
${history.map((m) => `${m.role === "user" ? "User" : "You"}: ${m.content}`).join("\n")}

User just said: "${userMessage}"

You do NOT choose gift IDs. You choose an ACTION and a SCOPE; the server resolves exactly which records to change.

SCOPE — pick one:
- "SELECTED" → the user means the finding they clicked ([#${selectedIdx}]). Use this for "this", "this one", "the selected", "isko", "yeh wala", or any vague instruction when something is selected. THIS IS THE DEFAULT when a finding is selected.
- "ALL_SAME_NAME" → the user explicitly says "all", "sab", "every gupta", "all the X". Affects every finding sharing that name.
- "SPECIFIC" → the user wants distinct names per group (e.g. "number them gupta 1, 2, 3") or names specific other findings. Provide the exact targetIndices and/or renames.

ACTIONS:
- DELETE → remove duplicate entries (server keeps the first, deletes the rest). Give scope (+ targetIndices if SPECIFIC).
- RENAME → change the sender name.
    • For SELECTED or ALL_SAME_NAME: provide a single "newName".
    • For SPECIFIC numbering: provide "renames": [{"findingIndex": 0, "newName": "Gupta 1"}, ...].
- DISMISS → mark valid, no DB change. Give scope (+ targetIndices if SPECIFIC).
- REPLY_ONLY → a question, or nothing is selected and the target is unclear.

CRITICAL: If a finding is selected and the user says "change the selected name to X", use action RENAME, scope SELECTED, newName "X". Do NOT widen to other findings. A selected EXACT_DUPLICATE finding may contain several duplicate entries of the same person — renaming it updates all of that one person's duplicate rows, which is correct; tell the user how many entries you updated.

Be warm and brief (max 2 sentences). State the count of entries changed.

Return ONLY valid JSON (no markdown):
{
  "action": "DELETE" | "RENAME" | "DISMISS" | "REPLY_ONLY",
  "scope": "SELECTED" | "ALL_SAME_NAME" | "SPECIFIC",
  "newName": "single new name (RENAME with SELECTED/ALL_SAME_NAME)",
  "renames": [{"findingIndex": 0, "newName": "Gupta 1"}],
  "targetIndices": [0],
  "reply": "Your reply here"
}`;

    const result = await model.generateContent(systemContext);
    const decision: AIDecision = JSON.parse(result.response.text());

    const validIdx = (i: number) => i >= 0 && i < report.findings.length;
    const giftIdsForFinding = (idx: number): string[] => report.findings[idx]?.giftIds ?? [];

    // Resolve which finding indices to act on — deterministic, server-side.
    const resolveIndices = (scope: Scope, targetIndices?: number[]): number[] => {
      if (scope === "SELECTED") {
        return selectedIdx >= 0 ? [selectedIdx] : [];
      }
      if (scope === "ALL_SAME_NAME") {
        const baseName = (selectedIdx >= 0 ? report.findings[selectedIdx].namesInvolved : "").trim().toLowerCase();
        if (baseName) {
          return report.findings
            .map((f, i) => ({ f, i }))
            .filter(({ f }) => f.namesInvolved.trim().toLowerCase() === baseName)
            .map(({ i }) => i);
        }
        // nothing selected to anchor the name → fall back to whatever the AI listed
        return (targetIndices ?? []).filter(validIdx);
      }
      // SPECIFIC
      return (targetIndices ?? []).filter(validIdx);
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

    if (decision.action === "DELETE") {
      const indices = resolveIndices(decision.scope, decision.targetIndices);
      const idsToDelete = indices.flatMap((i) => giftIdsForFinding(i).slice(1)); // keep first, delete rest
      const safeIds = await verifyGiftIds(idsToDelete);
      if (safeIds.length > 0) {
        await prisma.gift.deleteMany({ where: { id: { in: safeIds } } });
      }
      return {
        success: true,
        reply: decision.reply,
        action: "DELETE",
        deletedGiftIds: safeIds,
        resolvedFindingIndices: indices,
      };
    }

    if (decision.action === "RENAME") {
      const allRenamedIds: string[] = [];
      const resolved: number[] = [];

      // Did the user EXPLICITLY ask to widen beyond the selected one?
      const wantsAll = /\b(all|sab|saare|saari|every|everyone|sabhi)\b/i.test(userMessage);

      // SPECIFIC numbering (e.g. "name them gupta 1, 2, 3"): each finding its own name.
      // Only honoured when the user actually wants multiple — never when a single box is selected.
      if (decision.renames?.length && decision.renames.length > 1) {
        await Promise.all(
          decision.renames.map(async ({ findingIndex, newName }) => {
            if (!validIdx(findingIndex) || !newName?.trim()) return;
            const safeIds = await verifyGiftIds(giftIdsForFinding(findingIndex));
            if (safeIds.length > 0) {
              await prisma.gift.updateMany({ where: { id: { in: safeIds } }, data: { sender: newName.trim() } });
              allRenamedIds.push(...safeIds);
              resolved.push(findingIndex);
            }
          })
        );
      } else {
        const newName = decision.newName?.trim() || decision.renames?.[0]?.newName?.trim();
        if (newName) {
          // DETERMINISTIC GUARD: if a box is selected and the user did NOT say "all",
          // rename ONLY that selected finding — never anyone else, whatever the AI guessed.
          const indices =
            selectedIdx >= 0 && !wantsAll
              ? [selectedIdx]
              : resolveIndices(decision.scope, decision.targetIndices);

          const ids = indices.flatMap((i) => giftIdsForFinding(i));
          const safeIds = await verifyGiftIds(ids);
          if (safeIds.length > 0) {
            await prisma.gift.updateMany({ where: { id: { in: safeIds } }, data: { sender: newName } });
            allRenamedIds.push(...safeIds);
            resolved.push(...indices);
          }
        }
      }

      return {
        success: true,
        reply: decision.reply,
        action: "RENAME",
        renamedGiftIds: allRenamedIds,
        resolvedFindingIndices: resolved,
      };
    }

    if (decision.action === "DISMISS") {
      const indices = resolveIndices(decision.scope, decision.targetIndices);
      return {
        success: true,
        reply: decision.reply,
        action: "DISMISS",
        resolvedFindingIndices: indices,
      };
    }

    return { success: true, reply: decision.reply };
  } catch (error) {
    console.error("Chat failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
