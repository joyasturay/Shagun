"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/db/lib/prisma";
import { randomUUID } from "crypto";
import { auth } from "../lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type Severity = "HIGH" | "MEDIUM" | "LOW";
export type FindingType =
  | "EXACT_DUPLICATE"
  | "FUZZY_DUPLICATE"
  | "MISSING_SENDER"
  | "UNUSUAL_AMOUNT"
  | "SUSPICIOUS_PATTERN";

export type Finding = {
  type: FindingType;
  severity: Severity;
  giftIds: string[];
  namesInvolved: string;
  amounts: number[];
  reason: string;
  recommendation: string;
  bagNumbers?: number[];
};

export type AuditReport = {
  auditId: string;
  timestamp: string;
  eventId: string;
  summary: {
    totalAnalyzed: number;
    totalFlagged: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    totalAmount: number;
  };
  findings: Finding[];
  verdict: "CLEAN" | "REVIEW_REQUIRED" | "CRITICAL_ISSUES";
};

const STANDARD_SHAGUN = new Set([51, 101, 201, 501, 1001, 1100, 1500, 2100, 2501, 5100, 5001, 11000]);

function runRules(gifts: { id: string; sender: string | null; amount: number | null; createdAt: Date; bagNumber: number }[]): Finding[] {
  const findings: Finding[] = [];

  // Rule 1: Duplicate sender names
  const nameGroups = new Map<string, typeof gifts>();
  for (const gift of gifts) {
    if (!gift.sender || gift.sender.trim() === "") continue;
    const key = gift.sender.trim().toLowerCase();
    const group = nameGroups.get(key) ?? [];
    group.push(gift);
    nameGroups.set(key, group);
  }
  for (const [, group] of nameGroups) {
    if (group.length < 2) continue;
    const amountGroups = new Map<number | null, typeof gifts>();
    for (const gift of group) {
      const amt = gift.amount ?? null;
      const ag = amountGroups.get(amt) ?? [];
      ag.push(gift);
      amountGroups.set(amt, ag);
    }
    for (const [amt, dupes] of amountGroups) {
      if (dupes.length < 2) continue;
      const bags = [...new Set(dupes.map((g) => g.bagNumber))];
      findings.push({
        type: "EXACT_DUPLICATE",
        severity: "HIGH",
        giftIds: dupes.map((g) => g.id),
        namesInvolved: dupes[0].sender!,
        amounts: amt !== null ? [amt] : [],
        bagNumbers: bags,
        reason:
          amt !== null
            ? `"${dupes[0].sender}" appears ${dupes.length}× with the same amount ₹${amt} (Bag${bags.length > 1 ? "s" : ""} #${bags.join(", #")}). Almost certainly a double-entry.`
            : `"${dupes[0].sender}" appears ${dupes.length}× with no amount recorded. Likely entered multiple times by mistake.`,
        recommendation: `Keep one entry and delete the ${dupes.length - 1} duplicate(s).`,
      });
    }
    const uniqueAmounts = new Set(group.map((g) => g.amount ?? null));
    if (uniqueAmounts.size > 1) {
      const bags = [...new Set(group.map((g) => g.bagNumber))];
      findings.push({
        type: "SUSPICIOUS_PATTERN",
        severity: "MEDIUM",
        giftIds: group.map((g) => g.id),
        namesInvolved: group[0].sender!,
        amounts: group.map((g) => g.amount ?? 0).filter(Boolean),
        bagNumbers: bags,
        reason: `"${group[0].sender}" appears ${group.length}× with different amounts. Could be separate family members or a correction.`,
        recommendation: "Confirm with the collector whether these are distinct guests.",
      });
    }
  }

  // Rule 2: Missing sender
  for (const gift of gifts.filter((g) => !g.sender || g.sender.trim() === "")) {
    findings.push({
      type: "MISSING_SENDER",
      severity: "LOW",
      giftIds: [gift.id],
      namesInvolved: "Unknown",
      amounts: gift.amount ? [gift.amount] : [],
      bagNumbers: [gift.bagNumber],
      reason: "Gift recorded with no sender name.",
      recommendation: "Update the sender field before sealing the bag.",
    });
  }

  // Rule 3: Unusual high amounts
  for (const gift of gifts) {
    if (gift.amount == null) continue;
    if (gift.amount > 20000 && !STANDARD_SHAGUN.has(gift.amount)) {
      findings.push({
        type: "UNUSUAL_AMOUNT",
        severity: "MEDIUM",
        giftIds: [gift.id],
        namesInvolved: gift.sender || "Unknown",
        amounts: [gift.amount],
        bagNumbers: [gift.bagNumber],
        reason: `₹${gift.amount.toLocaleString("en-IN")} is exceptionally high and non-standard.`,
        recommendation: "Cross-check the physical envelope to confirm the amount.",
      });
    }
  }

  return findings;
}

export async function scanEventForAnomalies(
  eventId: string
): Promise<{ success: true; report: AuditReport } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const event = await prisma.events.findUnique({ where: { id: eventId }, select: { userId: true } });
    if (!event || event.userId !== session.user.id) return { success: false, error: "Access denied" };

    const rawGifts = await prisma.gift.findMany({
      where: { batch: { event: { eventId } } },
      select: {
        id: true, sender: true, amount: true, createdAt: true,
        batch: { select: { bagNumber: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const gifts = rawGifts.map((g) => ({ ...g, bagNumber: g.batch.bagNumber }));

    const findings = runRules(gifts);

    // AI fuzzy check on unflagged gifts
    let aiFindings: Finding[] = [];
    if (gifts.length >= 2) {
      try {
        const alreadyFlaggedIds = new Set(findings.flatMap((f) => f.giftIds));
        const unflagged = gifts.filter((g) => !alreadyFlaggedIds.has(g.id));
        if (unflagged.length >= 2) {
          const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" },
          });
          const prompt = `You are a forensic auditor for Indian wedding gift ledgers. Detect double-entry errors from name typos only.

RULES: Only flag when BOTH are true: names are specific AND nearly identical (typo-level), AND the amount matches exactly.
Do NOT flag common surnames alone or standard shagun amounts alone.
If unsure, do NOT flag.

Return ONLY: {"findings": [{"giftIds":[],"namesInvolved":"","amounts":[],"reason":"","recommendation":""}]}

Data: ${JSON.stringify(unflagged.map((g) => ({ id: g.id, sender: g.sender, amount: g.amount, bag: g.bagNumber })))}`;

          const result = await model.generateContent(prompt);
          const raw = JSON.parse(result.response.text());
          aiFindings = (raw.findings ?? []).map((f: Finding) => ({
            type: "FUZZY_DUPLICATE" as FindingType,
            severity: "MEDIUM" as Severity,
            giftIds: f.giftIds,
            namesInvolved: f.namesInvolved,
            amounts: f.amounts,
            reason: f.reason,
            recommendation: f.recommendation,
          }));
        }
      } catch { /* AI failure is non-fatal */ }
    }

    const allFindings = [...findings, ...aiFindings];
    const highRisk = allFindings.filter((f) => f.severity === "HIGH").length;
    const mediumRisk = allFindings.filter((f) => f.severity === "MEDIUM").length;
    const lowRisk = allFindings.filter((f) => f.severity === "LOW").length;
    const totalAmount = gifts.reduce((s, g) => s + (g.amount ?? 0), 0);

    return {
      success: true,
      report: {
        auditId: randomUUID().slice(0, 8).toUpperCase(),
        timestamp: new Date().toISOString(),
        eventId,
        summary: { totalAnalyzed: gifts.length, totalFlagged: allFindings.length, highRisk, mediumRisk, lowRisk, totalAmount },
        findings: allFindings,
        verdict: highRisk > 0 ? "CRITICAL_ISSUES" : mediumRisk > 0 ? "REVIEW_REQUIRED" : "CLEAN",
      },
    };
  } catch (error) {
    console.error("Audit failed:", error);
    return { success: false, error: "Audit engine failed. Please try again." };
  }
}
