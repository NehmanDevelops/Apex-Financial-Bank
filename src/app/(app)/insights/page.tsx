"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTransactions, DemoTransaction } from "@/lib/demoStore";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

// Category mapping for transactions
function categorize(description: string): string {
  const d = description.toLowerCase();
  if (d.includes("starbucks") || d.includes("uber eats") || d.includes("restaurant")) return "Food & Dining";
  if (d.includes("uber") || d.includes("gas")) return "Transportation";
  if (d.includes("netflix") || d.includes("spotify") || d.includes("amazon")) return "Entertainment";
  if (d.includes("hydro") || d.includes("rogers") || d.includes("bell") || d.includes("enbridge")) return "Utilities";
  if (d.includes("costco") || d.includes("walmart")) return "Shopping";
  if (d.includes("payroll") || d.includes("salary")) return "Income";
  if (d.includes("transfer") || d.includes("e-transfer")) return "Transfers";
  return "Other";
}

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#ef4444",
  "Transportation": "#f97316",
  "Entertainment": "#eab308",
  "Utilities": "#22c55e",
  "Shopping": "#3b82f6",
  "Income": "#10b981",
  "Transfers": "#8b5cf6",
  "Other": "#6b7280",
};

export default function InsightsPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }
      setTransactions(getTransactions());
      setIsLoaded(true);
    }
  }, [router]);

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
      </div>
    );
  }

  // Calculate spending by category (only debits)
  const debits = transactions.filter(t => t.type === "DEBIT");
  const categoryTotals: Record<string, number> = {};

  for (const t of debits) {
    const cat = categorize(t.description);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
  }

  const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Calculate this month's spending
  const now = new Date();
  const thisMonth = debits.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Insights</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Spending Insights</h1>
      <p className="mt-2 text-sm text-slate-600">Track your spending and budget progress.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Summary Cards */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0b6aa9] to-[#064e7a] p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
          <h2 className="text-sm font-medium text-white/80">This Month</h2>
          <div className="mt-2 text-4xl font-bold">{formatMoney(thisMonthTotal)}</div>
          <div className="mt-1 text-sm text-white/70">Total spending</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              {thisMonth.length} transactions
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:scale-[1.02]">
          <h2 className="text-lg font-semibold text-slate-900">Budget Progress</h2>
          <p className="mt-1 text-sm text-slate-500">Monthly budget: $2,000</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Used</span>
              <span className="font-semibold text-slate-900">{Math.min(100, Math.round((thisMonthTotal / 2000) * 100))}%</span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-[#0b6aa9] to-[#22c55e] transition-all duration-500"
                style={{ width: `${Math.min(100, (thisMonthTotal / 2000) * 100)}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {formatMoney(Math.max(0, 2000 - thisMonthTotal))} remaining
            </div>
          </div>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Spending by Category</h2>
        <p className="mt-1 text-sm text-slate-500">All transactions breakdown</p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Pie Chart Visual */}
          <div className="flex items-center justify-center">
            <div className="relative h-48 w-48">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {(() => {
                  let cumulative = 0;
                  return sortedCategories.map(([cat, amount]) => {
                    const percent = (amount / totalSpending) * 100;
                    const dashArray = `${percent} ${100 - percent}`;
                    const dashOffset = -cumulative;
                    cumulative += percent;
                    return (
                      <circle
                        key={cat}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={CATEGORY_COLORS[cat] || "#6b7280"}
                        strokeWidth="20"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-500 hover:opacity-80"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-slate-900">{formatMoney(totalSpending)}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            {sortedCategories.map(([cat, amount]) => {
              const percent = Math.round((amount / totalSpending) * 100);
              return (
                <div key={cat} className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || "#6b7280" }}
                      ></div>
                      <span className="text-sm font-medium text-slate-700">{cat}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{formatMoney(amount)}</div>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full transition-all duration-500 group-hover:opacity-80"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: CATEGORY_COLORS[cat] || "#6b7280"
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions by Category */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {debits.slice(0, 8).map((t) => {
            const cat = categorize(t.description);
            return (
              <div key={t.id} className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || "#6b7280" }}
                  >
                    {t.description.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{t.description}</div>
                    <div className="text-xs text-slate-500">{cat} • {new Date(t.date).toLocaleDateString("en-CA")}</div>
                  </div>
                </div>
                <div className="font-semibold text-red-600">-{formatMoney(t.amount)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
