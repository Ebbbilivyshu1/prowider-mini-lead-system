"use client";

import useSWR from "swr";
import React from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: providers, error, isLoading, mutate } = useSWR(
    "/api/providers",
    fetcher,
    { refreshInterval: 5000, dedupingInterval: 2000 }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-slate-400">Loading providers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-rose-400">Failed to load provider data.</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Provider Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {providers?.map((provider: any) => (
          <div
            key={provider.id}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-indigo-300 mb-2">
              {provider.name}
            </h2>
            <p className="text-slate-400 text-sm mb-2">
              Quota: {provider.currentQuota} / {provider.maxQuota}
            </p>
            <p className="text-slate-400 text-sm mb-4">
              Leads Received: {provider.leadsReceived}
            </p>
            <h3 className="font-medium text-slate-300 mb-2">Assigned Leads</h3>
            {provider.leads && provider.leads.length > 0 ? (
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {provider.leads.map((lead: any) => (
                  <li
                    key={lead.id}
                    className="bg-slate-800/30 rounded p-2 text-xs text-slate-200"
                  >
                    <div>
                      <span className="font-medium">{lead.name}</span> –
                      <span className="ml-1">{lead.phone}</span>
                    </div>
                    <div className="text-slate-400">
                      {lead.serviceName} • {new Date(lead.assignedAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">No leads assigned yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
