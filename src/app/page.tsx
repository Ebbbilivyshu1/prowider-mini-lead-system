import React from "react";

export default function Home() {
  return (
    <div className="py-12 sm:py-16">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          <span className="block">Prowider Mini</span>
          <span className="block text-indigo-400 text-3xl sm:text-4xl md:text-5xl mt-2">
            Lead Distribution & Fair Allocation
          </span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          An enterprise-grade, concurrent lead generation and round-robin allocation engine. Designed for PostgreSQL consistency, real-time sync, and webhook safety.
        </p>
      </div>

      {/* Grid of features */}
      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/30 transition group flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-lg mb-6 group-hover:scale-110 transition duration-300">
              1
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Request Service</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A public service enquiry form with strict, database-enforced duplicate validation. Ensures same customer cannot submit duplicate enquiries for the same service.
            </p>
          </div>
          <a
            href="/request-service"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-indigo-300 bg-slate-800/30 hover:bg-slate-800 hover:text-white transition"
          >
            Open Form
          </a>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/30 transition group flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-lg mb-6 group-hover:scale-110 transition duration-300">
              2
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Provider Dashboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A real-time monitor for provider allocations. View remaining monthly quotas, total received counts, and detailed log tables of assigned leads.
            </p>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-indigo-300 bg-slate-800/30 hover:bg-slate-800 hover:text-white transition"
          >
            Open Dashboard
          </a>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/30 transition group flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-lg mb-6 group-hover:scale-110 transition duration-300">
              3
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Testing Tools</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Simulate payment gateway confirm webhook events with idempotency verification, and execute 10 concurrent requests to test fairness and thread safety under load.
            </p>
          </div>
          <a
            href="/test-tools"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-indigo-300 bg-slate-800/30 hover:bg-slate-800 hover:text-white transition"
          >
            Open Test Tools
          </a>
        </div>
      </div>

      {/* Rules Summary Box */}
      <div className="mt-16 bg-slate-900/30 border border-slate-900 rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-slate-200 mb-4">Core Allocation Rules Matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm text-left text-slate-400">
            <thead>
              <tr className="text-slate-300">
                <th className="py-2 px-4">Service</th>
                <th className="py-2 px-4">Mandatory Assignment</th>
                <th className="py-2 px-4">Fair Pool (Round-Robin)</th>
                <th className="py-2 px-4">Total Assignments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-200">Service 1</td>
                <td className="py-3 px-4">Provider 1</td>
                <td className="py-3 px-4">Providers 2, 3, 4</td>
                <td className="py-3 px-4">Exactly 3</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-200">Service 2</td>
                <td className="py-3 px-4">Provider 5</td>
                <td className="py-3 px-4">Providers 6, 7, 8</td>
                <td className="py-3 px-4">Exactly 3</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-200">Service 3</td>
                <td className="py-3 px-4">Provider 1, Provider 4</td>
                <td className="py-3 px-4">Providers 2, 3, 5, 6, 7, 8</td>
                <td className="py-3 px-4">Exactly 3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
