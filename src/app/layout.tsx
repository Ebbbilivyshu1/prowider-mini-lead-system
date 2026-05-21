import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prowider Mini - Lead Distribution & Fair Allocation",
  description: "Enterprise-grade lead generation and provider allocation system with real-time updates and webhook safety.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold tracking-tight text-indigo-400 hover:text-indigo-300">
                Prowider Mini
              </a>
              <nav className="hidden md:flex space-x-6">
                <a href="/request-service" className="text-sm font-medium text-slate-300 hover:text-white transition">
                  Request Service
                </a>
                <a href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition">
                  Provider Dashboard
                </a>
                <a href="/test-tools" className="text-sm font-medium text-slate-300 hover:text-white transition">
                  Testing Tools
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                System Active
              </span>
            </div>
          </div>
          {/* Mobile navigation (fallback simple links) */}
          <div className="flex md:hidden justify-around py-2 border-t border-slate-800/50 bg-slate-900/30">
            <a href="/request-service" className="text-xs text-slate-300">Form</a>
            <a href="/dashboard" className="text-xs text-slate-300">Dashboard</a>
            <a href="/test-tools" className="text-xs text-slate-300">Test Tools</a>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          Prowider Mini Lead Distribution System Assignment • Built for Concurrency and Reliability
        </footer>
      </body>
    </html>
  );
}
