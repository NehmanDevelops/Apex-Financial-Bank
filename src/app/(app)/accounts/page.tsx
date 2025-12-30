"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

function labelAccountType(t: string) {
  if (t === "CHEQUING") return "Chequing";
  if (t === "SAVINGS") return "Savings";
  if (t === "CREDIT_CARD") return "Visa Infinite";
  return t;
}

// Demo data
const demoAccounts = [
  { id: "1", type: "CHEQUING", balance: 4520.50, accountNumber: "000-1234567" },
  { id: "2", type: "SAVINGS", balance: 12400.00, accountNumber: "001-7654321" },
  { id: "3", type: "CREDIT_CARD", balance: -450.23, accountNumber: "VISA-4381" },
];

const demoTransactions = [
  { id: "1", accountId: "1", amount: 2860.00, type: "CREDIT", description: "Payroll Deposit", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: "POSTED" },
  { id: "2", accountId: "1", amount: 8.45, type: "DEBIT", description: "Starbucks", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: "POSTED" },
  { id: "3", accountId: "1", amount: 24.18, type: "DEBIT", description: "Uber", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), status: "POSTED" },
  { id: "4", accountId: "2", amount: 500.00, type: "CREDIT", description: "Monthly Savings Transfer", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), status: "POSTED" },
  { id: "5", accountId: "3", amount: 61.92, type: "DEBIT", description: "Amazon Marketplace", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: "POSTED" },
];

export default function AccountsPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }
      setIsLoaded(true);
    }
  }, [router]);

  if (!isLoaded) {
    return <div className="py-20 text-center text-slate-500">Loading...</div>;
  }

  const byAccount = new Map<string, typeof demoTransactions>();
  for (const t of demoTransactions) {
    const arr = byAccount.get(t.accountId) ?? [];
    arr.push(t);
    byAccount.set(t.accountId, arr);
  }

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Accounts</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Accounts</h1>
      <p className="mt-2 text-sm text-slate-600">Balances and recent activity across your products.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {demoAccounts.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-700">{labelAccountType(a.type)}</div>
            <div className="mt-1 text-xs text-slate-500">{a.accountNumber}</div>
            <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{formatMoney(a.balance)}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-6">
        {demoAccounts.map((a) => {
          const rows = (byAccount.get(a.id) ?? []).slice(0, 5);
          return (
            <div key={a.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{labelAccountType(a.type)}</div>
                  <div className="mt-0.5 text-xs text-slate-500">Recent activity</div>
                </div>
                <div className="text-sm font-semibold text-slate-900">{formatMoney(a.balance)}</div>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.length ? (
                    rows.map((t) => {
                      const positive = t.type === "CREDIT";
                      const amountText = formatMoney(positive ? t.amount : -t.amount);
                      return (
                        <tr key={t.id} className="text-slate-700">
                          <td className="px-5 py-3 font-medium text-slate-900">
                            <Link href={`/transactions/${t.id}`} className="hover:underline">
                              {t.description}
                            </Link>
                          </td>
                          <td className="px-5 py-3">{t.date.toLocaleDateString("en-CA")}</td>
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
                    })
                  ) : (
                    <tr>
                      <td className="px-5 py-6 text-sm text-slate-500" colSpan={4}>
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
