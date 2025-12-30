"use client";

import { useState } from "react";
import { Send, CreditCard, PiggyBank, Receipt, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { icon: Send, label: "Send e-Transfer", href: "/etransfer/send", color: "bg-blue-500" },
        { icon: CreditCard, label: "Pay Bills", href: "/bill-pay", color: "bg-emerald-500" },
        { icon: PiggyBank, label: "Move Money", href: "/move-money", color: "bg-purple-500" },
        { icon: Receipt, label: "View Insights", href: "/insights", color: "bg-amber-500" },
    ];

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${isOpen
                        ? "bg-slate-800 rotate-45"
                        : "bg-gradient-to-r from-[#0b6aa9] to-[#0d7dc4] hover:scale-110"
                    }`}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <ArrowRight className="h-6 w-6 text-white" />
                )}
            </button>

            {/* Actions Menu */}
            <div className={`fixed bottom-24 right-6 z-50 flex flex-col gap-3 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}>
                {actions.map((action, i) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg transition-all hover:scale-105 dark:bg-slate-800"
                        style={{ transitionDelay: `${i * 50}ms` }}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${action.color}`}>
                            <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
