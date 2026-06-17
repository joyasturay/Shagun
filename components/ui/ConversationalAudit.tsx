"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { scanEventForAnomalies, type AuditReport, type Finding } from "@/app/actions/detect-anomalies";
import { chatWithAudit, type ChatMessage } from "@/app/actions/audit-chat";

const SEVERITY_BAR: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-400",
  LOW: "bg-slate-300",
};

const SEVERITY_BADGE: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function ConversationalAudit({ eventId }: { eventId: string }) {
  const [scanning, startScan] = useTransition();
  const [chatting, startChat] = useTransition();

  const [report, setReport] = useState<AuditReport | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(new Set());
  const [deletedGiftIds, setDeletedGiftIds] = useState<Set<string>>(new Set());
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
        setDeletedGiftIds(new Set());
        setActiveFindingIdx(null);
        setMessages([{
          role: "assistant",
          content: result.report.verdict === "CLEAN"
            ? "Great news — I scanned all gifts across every bag and everything looks clean. No duplicates or issues found!"
            : `I've finished the audit. Found ${result.report.summary.totalFlagged} item${result.report.summary.totalFlagged !== 1 ? "s" : ""} that need your attention. Click on any finding below and tell me what to do — just talk to me naturally.`,
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
        if (result.action === "DELETE_GIFTS" && result.deletedGiftIds?.length) {
          setDeletedGiftIds((prev) => new Set([...prev, ...result.deletedGiftIds!]));
        }
        // Clear active finding if it got resolved
        if (activeFindingIdx !== null && result.resolvedFindingIndices?.includes(activeFindingIdx)) {
          setActiveFindingIdx(null);
        }
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: result.error }]);
      }
    });
  };

  const pendingFindings = report?.findings.filter((_, i) => !resolvedIds.has(i)) ?? [];
  const resolvedFindings = report?.findings.filter((_, i) => resolvedIds.has(i)) ?? [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              AI Audit Engine
              <span className="px-2 py-0.5 text-[10px] font-bold bg-black text-white rounded-full uppercase tracking-wider">
                Conversational
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {report
                ? `Audit #${report.auditId} · ${new Date(report.timestamp).toLocaleString()} · ${report.summary.totalAnalyzed} gifts across all bags`
                : "Scans all bags in this event for duplicates, typos, and anomalies."}
            </p>
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 text-white font-semibold rounded-lg disabled:opacity-60 transition-all text-sm active:scale-95"
        >
          {scanning ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning…
            </>
          ) : (
            <>{report ? "Re-run Audit" : "Run Audit"}</>
          )}
        </button>
      </div>

      {!report && !scanning && (
        <div className="p-10 text-center text-slate-400 text-sm">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Run the audit to scan all bags in this event for issues.
        </div>
      )}

      {scanning && (
        <div className="p-8 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-14 bg-slate-100 rounded-xl" />)}
        </div>
      )}

      {report && !scanning && (
        <div className="flex flex-col lg:flex-row h-[600px]">

          {/* LEFT: Findings panel */}
          <div className="lg:w-[42%] border-r border-slate-100 flex flex-col overflow-hidden">
            {/* Summary bar */}
            <div className="px-4 py-3 border-b border-slate-100 grid grid-cols-4 gap-2 bg-slate-50/50">
              {[
                { label: "Total", value: report.summary.totalAnalyzed, color: "text-slate-900" },
                { label: "High", value: report.summary.highRisk, color: "text-red-600" },
                { label: "Review", value: report.summary.mediumRisk, color: "text-amber-600" },
                { label: "Resolved", value: resolvedIds.size, color: "text-emerald-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {pendingFindings.length === 0 && resolvedFindings.length === 0 && (
                <div className="py-8 text-center text-emerald-600 text-sm font-medium">
                  ✓ All clear — no issues found
                </div>
              )}

              {pendingFindings.length > 0 && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                  Needs Attention ({pendingFindings.length})
                </p>
              )}
              {report.findings.map((finding, idx) => {
                if (resolvedIds.has(idx)) return null;
                const isActive = activeFindingIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveFindingIdx(idx)}
                    className={`w-full text-left relative rounded-xl border overflow-hidden transition-all ${
                      isActive
                        ? "border-black shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`absolute left-0 top-0 w-1 h-full ${SEVERITY_BAR[finding.severity]}`} />
                    <div className="pl-4 pr-3 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${SEVERITY_BADGE[finding.severity]}`}>
                          {finding.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {finding.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 truncate">{finding.namesInvolved}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{finding.reason}</p>
                      {finding.amounts.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {finding.amounts.map((a, i) => (
                            <span key={i} className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              ₹{a.toLocaleString("en-IN")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </button>
                );
              })}

              {resolvedFindings.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mt-3 mb-1">
                    Resolved ({resolvedFindings.length})
                  </p>
                  {report.findings.map((finding, idx) => {
                    if (!resolvedIds.has(idx)) return null;
                    return (
                      <div key={idx} className="relative rounded-xl border border-slate-100 bg-slate-50 overflow-hidden opacity-60">
                        <div className="absolute left-0 top-0 w-1 h-full bg-emerald-400" />
                        <div className="pl-4 pr-3 py-2.5 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-xs font-medium text-slate-600 truncate">{finding.namesInvolved}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Active finding context strip */}
            {activeFindingIdx !== null && !resolvedIds.has(activeFindingIdx) && (
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-slate-500 flex-shrink-0">Discussing:</span>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {report.findings[activeFindingIdx].namesInvolved}
                  </span>
                </div>
                <button
                  onClick={() => setActiveFindingIdx(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 flex-shrink-0 ml-2"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold mr-2 mt-1 flex-shrink-0">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-black text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatting && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold mr-2 flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100">
              {activeFindingIdx === null && report.findings.length > 0 && pendingFindings.length > 0 && (
                <p className="text-[11px] text-slate-400 text-center mb-2">
                  ← Select a finding on the left to start resolving it
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={chatting || !report}
                  placeholder={
                    activeFindingIdx !== null
                      ? `e.g. "this is my family, remove the duplicate" or "both are valid guests"`
                      : "Ask me anything about the audit…"
                  }
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-black transition-colors placeholder:text-slate-300 disabled:bg-slate-50"
                />
                <button
                  onClick={handleSend}
                  disabled={chatting || !input.trim() || !report}
                  className="px-4 py-2.5 bg-black text-white rounded-xl disabled:opacity-40 transition-all hover:bg-slate-800 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {report && !scanning && (
        <div className="px-5 py-3 border-t border-slate-100 flex justify-between text-xs text-slate-400 bg-slate-50">
          <span>Audit ID: <span className="font-mono font-bold text-slate-600">{report.auditId}</span></span>
          <span>Event total: <span className="font-bold text-slate-700">₹{report.summary.totalAmount.toLocaleString("en-IN")}</span></span>
        </div>
      )}
    </div>
  );
}
