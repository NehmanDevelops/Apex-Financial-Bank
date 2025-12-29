import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    orderBy: { type: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { userId: session.user.id },
    },
    orderBy: { date: "desc" },
    take: 25,
    include: { account: true },
  });

  const byAccount = new Map<string, typeof transactions>();
  for (const t of transactions) {
    const key = t.accountId;
    const arr = byAccount.get(key) ?? [];
    arr.push(t);
    byAccount.set(key, arr);
  }

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Accounts</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Accounts</h1>
      <p className="mt-2 text-sm text-slate-600">Balances and recent activity across your products.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {accounts.map((a: (typeof accounts)[number]) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-700">{labelAccountType(a.type)}</div>
            <div className="mt-1 text-xs text-slate-500">{a.accountNumber}</div>
            <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{formatMoney(a.balance)}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-6">
        {accounts.map((a: (typeof accounts)[number]) => {
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
                    rows.map((t: (typeof rows)[number]) => {
                      const positive = t.type === "CREDIT";
                      const amountText = formatMoney(positive ? t.amount : -t.amount);
                      return (
                        <tr key={t.id} className="text-slate-700">
                          <td className="px-5 py-3 font-medium text-slate-900">
                            <Link href={`/transactions/${t.id}`} className="hover:underline">
                              {t.description}
                            </Link>
                          </td>
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
