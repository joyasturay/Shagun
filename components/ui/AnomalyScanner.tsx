"use client";

import { useState, useTransition } from "react";
import { scanEventForAnomalies, type AuditReport } from "@/app/actions/detect-anomalies";

const SEVERITY_CONFIG = {
  HIGH: {
    label: "HIGH RISK",
    bar: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  MEDIUM: {
    label: "REVIEW",
    bar: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  LOW: {
    label: "LOW",
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const VERDICT_CONFIG = {
  CLEAN: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
    icon: "✓",
    label: "All Clear",
    sub: "No anomalies detected. Batch is clean and ready to seal.",
  },
  REVIEW_REQUIRED: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    icon: "⚠",
    label: "Review Required",
    sub: "Potential issues found. Review findings before sealing.",
  },
  CRITICAL_ISSUES: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: "✕",
    label: "Critical Issues",
    sub: "High-risk anomalies detected. Do not seal until resolved.",
  },
};

export default function AnomalyScanner({ batchId }: { batchId: string }) {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const handleScan = () => {
    startTransition(async () => {
      const result = await scanEventForAnomalies(batchId);
      if (result.success) {
        setReport(result.report);
        setDismissed(new Set());
      }
    });
  };

  const visibleFindings = report?.findings.filter((_, i) => !dismissed.has(i)) ?? [];

  return (
    <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              Gemini Audit Engine
              <span className="px-2 py-0.5 text-[10px] font-bold bg-black text-white rounded-full uppercase tracking-wider">
                AI + Rules
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {report
                ? `Audit #${report.auditId} · ${new Date(report.timestamp).toLocaleString()}`
                : "Detects duplicates, typos, missing data, and unusual amounts."}
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-semibold rounded-lg disabled:opacity-60 transition-all shadow-sm active:scale-95 text-sm"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running Audit…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {report ? "Re-run Audit" : "Run Audit"}
            </>
          )}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Empty state */}
        {!report && !isPending && (
          <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
            Click &quot;Run Audit&quot; to analyze this batch for duplicates, typos, and data integrity issues.
          </div>
        )}

        {isPending && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg" />
            ))}
          </div>
        )}

        {/* Verdict banner */}
        {report && !isPending && (() => {
          const v = VERDICT_CONFIG[report.verdict];
          return (
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${v.bg}`}>
              <span className={`text-2xl font-black ${v.text}`}>{v.icon}</span>
              <div>
                <p className={`font-bold text-sm ${v.text}`}>{v.label}</p>
                <p className={`text-xs mt-0.5 ${v.text} opacity-80`}>{v.sub}</p>
              </div>
            </div>
          );
        })()}

        {/* Summary stats */}
        {report && !isPending && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Analyzed", value: report.summary.totalAnalyzed, color: "text-slate-900" },
              { label: "High Risk", value: report.summary.highRisk, color: "text-red-600" },
              { label: "Review", value: report.summary.mediumRisk, color: "text-amber-600" },
              { label: "Low", value: report.summary.lowRisk, color: "text-slate-500" },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Findings */}
        {report && !isPending && visibleFindings.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Findings ({visibleFindings.length})
            </p>
            {report.findings.map((finding, index) => {
              if (dismissed.has(index)) return null;
              const cfg = SEVERITY_CONFIG[finding.severity];
              return (
                <div key={index} className="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className={`absolute left-0 top-0 w-1 h-full ${cfg.bar}`} />
                  <div className="pl-5 pr-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${cfg.badge}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            {finding.type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 mb-1">{finding.namesInvolved}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{finding.reason}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01" />
                          </svg>
                          <span className="italic">{finding.recommendation}</span>
                        </div>
                        {finding.amounts.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {finding.amounts.map((amt, i) => (
                              <span key={i} className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                ₹{amt.toLocaleString("en-IN")}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setDismissed((prev) => new Set([...prev, index]))}
                        className="text-xs text-slate-400 hover:text-slate-700 font-medium whitespace-nowrap px-2 py-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer total */}
        {report && !isPending && (
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Audit ID: <span className="font-mono font-bold text-slate-600">{report.auditId}</span></span>
            <span>
              Batch total:{" "}
              <span className="font-bold text-slate-700">
                ₹{report.summary.totalAmount.toLocaleString("en-IN")}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
