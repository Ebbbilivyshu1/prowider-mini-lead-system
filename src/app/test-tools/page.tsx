"use client";

import React, { useState } from "react";

export default function TestToolsPage() {
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setResetStatus(null);
    setLoading(true);
    try {
      const res = await fetch("/api/webhook/reset-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: `txn-${Date.now()}` }),
      });
      const data = await res.json();
      setResetStatus(data.message || "Reset completed");
    } catch (e: any) {
      setResetStatus(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerateResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/test/generate-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setGenerateResult(data);
    } catch (e: any) {
      setGenerateResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Test Tools</h1>

      <section className="mb-12 p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">Quota Reset Webhook</h2>
        <p className="text-slate-400 mb-4">Sends an idempotent webhook to reset all provider quotas to the default (10).</p>
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-50"
        >
          Reset Provider Quotas
        </button>
        {resetStatus && (
          <p className="mt-3 text-sm text-slate-300">{resetStatus}</p>
        )}
      </section>

      <section className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">Concurrency Stress Test</h2>
        <p className="text-slate-400 mb-4">Generates 10 concurrent lead submissions to verify round‑robin fairness and quota handling.</p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-50"
        >
          Run Concurrency Test
        </button>
        {generateResult && (
          <pre className="mt-4 text-sm text-slate-200 whitespace-pre-wrap bg-slate-800/50 p-4 rounded">
            {JSON.stringify(generateResult, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
