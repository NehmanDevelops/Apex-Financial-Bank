"use client";

import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-[#0b6aa9] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Apex Financial</div>
                            <div className="text-xs text-slate-500">Demo Banking Application</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
                        <Link href="/accounts" className="hover:text-slate-900 transition-colors">Accounts</Link>
                        <Link href="/insights" className="hover:text-slate-900 transition-colors">Insights</Link>
                        <Link href="/test-board" className="hover:text-slate-900 transition-colors">Test Board</Link>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 md:flex-row">
                    <div className="text-xs text-slate-400">
                        © {currentYear} Apex Financial. This is a demo project for portfolio purposes.
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/NehmanDevelops"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            View on GitHub
                        </a>
                        <span className="text-xs text-slate-400">
                            Built with Next.js, Tailwind CSS & TypeScript
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
