"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { scanEventForAnomalies, type AuditReport } from "@/app/actions/detect-anomalies";
import { chatWithAudit, type ChatMessage } from "@/app/actions/audit-chat";

const SEVERITY_BADGE: Record<string, string> = {
  HIGH: "badge-outline border-sage-moss text-sage-moss",
  MEDIUM: "badge-lime",
  LOW: "badge-outline text-pewter border-pewter",
};

export default function ConversationalAudit({ eventId }: { eventId: string }) {
  const [scanning, startScan] = useTransition();
  const [chatting, startChat] = useTransition();

  const [report, setReport] = useState<AuditReport | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());
  const [activeFindingIdx, setActiveFindingIdx] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScan = () => {
    startScan(async () => {
      const result = await scanEventForAnomalies(eventId);
      if (result.success) {
        setReport(result.report);
        setResolvedIds(new Set());
        setActiveFindingIdx(null);
        setMessages([{
          role: "assistant",
          content: result.report.verdict === "CLEAN"
            ? "Great news — I scanned all gifts across every bag and everything looks clean. No duplicates or issues found!"
            : `I've finished the audit. Found ${result.report.summary.totalFlagged} item${result.report.summary.totalFlagged !== 1 ? "s" : ""} that need your attention. Click on any finding below and tell me what to do.`,
        }]);
      } else {
        setMessages([{ role: "assistant", content: "Audit failed. Please try again." }]);
      }
    });
  };

  const handleSend = () => {
    if (!input.trim() || !report) return;
    const userMsg = input.trim();
    setInput("");
    const activeFinding = activeFindingIdx !== null ? report.findings[activeFindingIdx] : null;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    startChat(async () => {
      const result = await chatWithAudit(userMsg, messages, report, activeFinding, eventId);
      if (result.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
        if (result.resolvedFindingIndices?.length) {
          setResolvedIds((prev) => new Set([...prev, ...result.resolvedFindingIndices!]));
        }
        if (activeFindingIdx !== null && result.resolvedFindingIndices?.includes(activeFindingIdx)) {
          setActiveFindingIdx(null);
        }
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: result.error }]);
      }
    });
  };

  const pendingFindings = report?.findings.filter((_, i) => !resolvedIds.has(i)) ?? [];

  return (
    <div className="overflow-hidden rounded-2xl bg-warm-stone">
      <div className="flex items-center justify-between border-b border-frosted-glass p-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[length:var(--text-body-sm)] font-medium text-forest-depths">
              AI Audit Engine
            </h3>
            <span className="badge-lime text-[10px]">Conversational</span>
          </div>
          <p className="mt-1 text-[length:var(--text-label)] text-pewter">
            {report
              ? `Audit #${report.auditId} · ${new Date(report.timestamp).toLocaleString()} · ${report.summary.totalAnalyzed} gifts`
              : "Scans all bags for duplicates, typos, and anomalies."}
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="btn-primary shrink-0 disabled:opacity-50"
        >
          {scanning ? "Scanning…" : report ? "Re-run audit" : "Run audit"}
        </button>
      </div>

      {!report && !scanning && (
        <div className="p-10 text-center text-[length:var(--text-caption)] text-pewter">
          Run the audit to scan all bags in this event for issues.
        </div>
      )}

      {scanning && (
        <div className="space-y-3 p-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-snow-white/60" />
          ))}
        </div>
      )}

      {report && !scanning && (
        <div className="flex h-[600px] flex-col lg:flex-row">
          <div className="flex flex-col overflow-hidden border-b border-frosted-glass lg:w-[42%] lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-4 gap-2 border-b border-frosted-glass px-4 py-3">
              {[
                { label: "Total", value: report.summary.totalAnalyzed },
                { label: "High", value: report.summary.highRisk },
                { label: "Review", value: report.summary.mediumRisk },
                { label: "Resolved", value: resolvedIds.size },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-seed-sans-mono text-[length:var(--text-body-sm)] font-medium text-forest-depths">
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-pewter">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {pendingFindings.length === 0 && resolvedIds.size === 0 && (
                <div className="py-8 text-center text-[length:var(--text-caption)] font-medium text-eucalyptus">
                  All clear — no issues found
                </div>
              )}

              {pendingFindings.length > 0 && (
                <p className="section-label px-1">
                  Needs attention ({pendingFindings.length})
                </p>
              )}

              {report.findings.map((finding, idx) => {
                if (resolvedIds.has(idx)) return null;
                const isActive = activeFindingIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveFindingIdx(idx)}
                    className={`w-full rounded-2xl p-4 text-left transition-colors ${
                      isActive ? "bg-snow-white" : "bg-snow-white/60 hover:bg-snow-white"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`${SEVERITY_BADGE[finding.severity]} text-[10px]`}>
                        {finding.severity}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-pewter">
                        {finding.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="truncate text-[length:var(--text-caption)] font-medium text-forest-depths">
                      {finding.namesInvolved}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[length:var(--text-label)] text-pewter">
                      {finding.reason}
                    </p>
                    {finding.amounts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {finding.amounts.map((a, i) => (
                          <span key={i} className="font-seed-sans-mono text-[11px] tracking-[0.015em] text-forest-depths">
                            ₹{a.toLocaleString("en-IN")}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {activeFindingIdx !== null && !resolvedIds.has(activeFindingIdx) && (
              <div className="flex items-center justify-between border-b border-frosted-glass px-4 py-2.5">
                <span className="truncate text-[length:var(--text-label)] text-pewter">
                  Discussing:{" "}
                  <span className="font-medium text-forest-depths">
                    {report.findings[activeFindingIdx].namesInvolved}
                  </span>
                </span>
                <button
                  onClick={() => setActiveFindingIdx(null)}
                  className="text-[length:var(--text-label)] text-pewter hover:text-forest-depths"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[length:var(--text-caption)] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-forest-depths text-snow-white"
                        : "bg-snow-white text-forest-depths"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatting && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-snow-white px-4 py-3 text-pewter">
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-frosted-glass p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={chatting || !report}
                  placeholder={
                    activeFindingIdx !== null
                      ? 'e.g. "remove the duplicate"'
                      : "Ask me anything about the audit…"
                  }
                  className="input-light flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={chatting || !input.trim() || !report}
                  className="btn-primary px-5 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {report && !scanning && (
        <div className="flex justify-between border-t border-frosted-glass px-5 py-3 text-[length:var(--text-label)] text-pewter">
          <span>
            Audit ID:{" "}
            <span className="font-seed-sans-mono tracking-[0.015em] text-forest-depths">
              {report.auditId}
            </span>
          </span>
          <span>
            Event total:{" "}
            <span className="font-seed-sans-mono font-medium tracking-[0.015em] text-forest-depths">
              ₹{report.summary.totalAmount.toLocaleString("en-IN")}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
