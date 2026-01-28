"use client";

import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

type CategoryRow = {
  id: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  spentText: string;
};

type Result =
  | { ok: true }
  | {
    ok: false;
    message: string;
  };

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function InsightsClient({
  categories: initialCategories,
  trend,
  month,
  year,
}: {
  categories: CategoryRow[];
  trend: Array<Record<string, number | string>>;
  month: number;
  year: number;
}) {
  // Mock action states for static export
  const [categories, setCategories] = useState(initialCategories);
  const [catPending, setCatPending] = useState(false);
  const [catState, setCatState] = useState<Result | null>(null);

  const [budgetPending, setBudgetPending] = useState(false);
  const [budgetState, setBudgetState] = useState<Result | null>(null);

  const catAction = async () => {
    setCatPending(true);
    setCatState(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCatState({ ok: true });
    setCatPending(false);
  };

  const budgetAction = async (formData: FormData) => {
    setBudgetPending(true);
    setBudgetState(null);
    await new Promise(resolve => setTimeout(resolve, 800));
    const catId = String(formData.get("categoryId") ?? "");
    const amount = Number(formData.get("amount") ?? 0);
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, budget: amount } : c));
    setBudgetState({ ok: true });
    setBudgetPending(false);
  };
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const s = catState ?? budgetState;
    if (!s) return;
    if (s.ok) {
      setToast("Updated.");
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [catState, budgetState]);

  const hasTrend = useMemo(() => trend.length > 0, [trend]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">Insights</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Spending Insights & Budgets</h1>
          <p className="mt-2 text-sm text-slate-600">Monthly budget tracking and trends by category.</p>
        </div>

        <form action={catAction}>
          <button
            type="submit"
            disabled={catPending}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            {catPending ? "Updating..." : "Update categories"}
          </button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="text-sm font-semibold text-slate-900">6-month spending trend</div>
          <div className="mt-1 text-xs text-slate-500">Debit spending by category</div>

          <div className="mt-4 h-72">
            {hasTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ left: 8, right: 12, top: 10, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${Number(v).toFixed(0)}`} />
                  <Tooltip formatter={(value: unknown) => formatMoney(Number(value))} />
                  <Legend />
                  {categories.map((c) => (
                    <Line key={c.id} type="monotone" dataKey={c.id} name={c.name} stroke={c.color} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Budgets</div>
          <div className="mt-1 text-xs text-slate-500">
            {new Date(year, month - 1, 1).toLocaleDateString("en-CA", { month: "long", year: "numeric" })}
          </div>

          <div className="mt-4 space-y-5">
            {categories.map((c) => {
              const budget = c.budget;
              const spent = c.spent;
              const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

              return (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs font-medium text-slate-600">
                      {c.spentText}
                      {budget > 0 ? ` / ${formatMoney(budget)}` : ""}
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>

                  <form action={budgetAction} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="categoryId" value={c.id} />
                    <input type="hidden" name="month" value={String(month)} />
                    <input type="hidden" name="year" value={String(year)} />
                    <input
                      name="amount"
                      inputMode="decimal"
                      defaultValue={budget > 0 ? String(budget) : ""}
                      placeholder="Set budget"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                    />
                    <button
                      type="submit"
                      disabled={budgetPending}
                      className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      Save
                    </button>
                  </form>

                  {budgetState && !budgetState.ok ? (
                    <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{budgetState.message}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {catState && !catState.ok ? <div className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{catState.message}</div> : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}
