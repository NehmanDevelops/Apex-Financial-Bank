import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DisputesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const disputes = await prisma.dispute.findMany({
    where: { userId },
    include: {
      transaction: {
        include: {
          account: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Disputes</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Disputes & Fraud Cases</h1>
      <p className="mt-2 text-sm text-slate-600">Track your submitted disputes and fraud reports.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium text-slate-600">
            <tr>
              <th className="px-5 py-3">Case</th>
              <th className="px-5 py-3">Reason</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Transaction</th>
              <th className="px-5 py-3">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {disputes.length ? (
              disputes.map((d) => (
                <tr key={d.id} className="text-slate-700">
                  <td className="px-5 py-3 font-semibold text-slate-900">{d.caseNumber}</td>
                  <td className="px-5 py-3">{d.reason}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/transactions/${d.transactionId}`} className="font-medium text-slate-900 hover:underline">
                      {d.transaction.description}
                    </Link>
                    <div className="mt-0.5 text-xs text-slate-500">{d.transaction.account.accountNumber}</div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{new Date(d.createdAt).toLocaleString("en-CA")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-sm text-slate-500">
                  No disputes yet. Open any transaction to report an issue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
