"use client";

import React, { useState, useEffect } from "react";

interface Service {
  id: string;
  name: string;
}

interface AllocationResult {
  lead: {
    id: string;
    name: string;
    phone: string;
    city: string;
    description: string;
  };
  assignedProviders: {
    id: number;
    name: string;
  }[];
}

export default function RequestServicePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    serviceName: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<AllocationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load services
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, serviceName: data[0].name }));
          }
        }
      })
      .catch((err) => console.error("Failed to load services:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccessResult(data);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        city: "",
        serviceName: services[0]?.name || "",
        description: "",
      });
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 backdrop-blur-md">
        <h2 className="text-2xl font-bold text-white mb-2">Request Service</h2>
        <p className="text-slate-400 text-sm mb-8">
          Submit your enquiry and our system will instantly match you with exactly three qualified providers.
        </p>

        {successResult && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <h4 className="font-bold text-white mb-2">🎉 Enquiry Received & Assigned!</h4>
            <p className="mb-2">Your lead has been registered successfully.</p>
            <div className="mt-2 bg-slate-950/50 rounded-lg p-3 border border-emerald-500/10">
              <span className="text-slate-400 text-xs block mb-1">Assigned Providers:</span>
              <ul className="list-disc list-inside font-semibold text-slate-200">
                {successResult.assignedProviders.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <h4 className="font-bold text-white mb-1">⚠️ Submission Failed</h4>
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9999999999"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. New York"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="serviceName" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Service Type
            </label>
            <select
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name} className="bg-slate-900 text-slate-100">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about the service you need..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <span>Submitting request...</span>
            ) : (
              <span>Submit Request</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
