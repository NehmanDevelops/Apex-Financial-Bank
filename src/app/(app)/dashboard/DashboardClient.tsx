"use client";

import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type AccountDTO = {
  id: string;
  type: "CHEQUING" | "SAVINGS" | "CREDIT_CARD";
  balance: number;
  accountNumber: string;
};

type TransactionDTO = {
  id: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  description: string;
  date: string;
  status: "POSTED" | "PENDING";
  accountType: AccountDTO["type"];
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

function labelAccountType(t: AccountDTO["type"]) {
  if (t === "CHEQUING") return "Chequing";
  if (t === "SAVINGS") return "Savings";
  return "Visa Infinite";
}

function categoryForDescription(description: string) {
  const d = description.toLowerCase();
  if (d.includes("hydro") || d.includes("enbridge") || d.includes("property tax") || d.includes("rent") || d.includes("mortgage")) {
    return "Housing";
  }
  if (d.includes("starbucks") || d.includes("tim hortons") || d.includes("restaurant") || d.includes("grocery") || d.includes("uber eats")) {
    return "Food";
  }
  if (d.includes("uber") || d.includes("transit") || d.includes("gas")) {
    return "Transport";
  }
  if (d.includes("amazon") || d.includes("shop") || d.includes("store")) {
    return "Shopping";
  }
  return "Other";
}

const CHART_COLORS = ["#0ea5e9", "#6366f1", "#f97316", "#22c55e", "#ef4444", "#64748b"]; 

export function DashboardClient({
  name,
  showTestBoard,
  accounts,
  transactions,
}: {
  name: string;
  showTestBoard?: boolean;
  accounts: AccountDTO[];
  transactions: TransactionDTO[];
}) {
  const [privacyMode, setPrivacyMode] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const spendingData = useMemo(() => {
    const sums = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "DEBIT") continue;
      const category = categoryForDescription(t.description);
      sums.set(category, (sums.get(category) ?? 0) + t.amount);
    }
    return Array.from(sums.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm font-medium text-slate-500">Dashboard</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {greeting}, {name}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setPrivacyMode((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          aria-pressed={privacyMode}
        >
          {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          Privacy Mode
        </button>
      </div>

      {showTestBoard ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">FOR RECRUITERS/INTERVIEWERS: TESTBOARD</div>
              <div className="mt-1 text-xs text-slate-500">
                Seed demo data, trigger flows (e-Transfer, bill pay, insights, disputes), and explore everything in one place.
              </div>
            </div>
            <Link
              href="/test-board"
              className="inline-flex items-center justify-center rounded-xl bg-[#0b6aa9] px-4 py-3 text-sm font-semibold text-white hover:bg-[#095f98]"
            >
              Open Test Board
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {accounts.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-700">{labelAccountType(a.type)}</div>
            <div className="mt-1 text-xs text-slate-500">{a.accountNumber}</div>
            <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              {privacyMode ? "****.**" : formatMoney(a.balance)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-slate-600">
                <tr>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentTransactions.map((t) => {
                  const positive = t.type === "CREDIT";
                  const amountText = privacyMode ? "****.**" : formatMoney(positive ? t.amount : -t.amount);
                  return (
                    <tr key={t.id} className="text-slate-700">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        <Link href={`/transactions/${t.id}`} className="hover:underline">
                          {t.description}
                        </Link>
                      </td>
                      <td className="px-5 py-3">{labelAccountType(t.accountType)}</td>
                      <td className="px-5 py-3">{new Date(t.date).toLocaleDateString("en-CA")}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {t.status}
                        </span>
                      </td>
                      <td className={"px-5 py-3 text-right font-semibold " + (positive ? "text-emerald-600" : "text-red-600")}>
                        {amountText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Spending Analytics</div>
            <div className="mt-1 text-xs text-slate-500">Where your money went (last {transactions.length} transactions)</div>

            <div className="mt-4 h-56">
              {spendingData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {spendingData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: unknown, name: unknown) => {
                        if (privacyMode) return ["****.**", String(name ?? "")];
                        const num = typeof value === "number" ? value : Number(value);
                        return [formatMoney(num), String(name ?? "")];
                      }}
                    />
                    <Legend verticalAlign="bottom" height={28} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">No spending data yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
