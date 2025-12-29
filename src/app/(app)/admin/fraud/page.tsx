import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approveFlaggedTransferAction, rejectFlaggedTransferAction } from "@/actions/fraudReview";

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

export default async function FraudAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const flaggedDelegate = (prisma as unknown as { flaggedTransfer?: unknown }).flaggedTransfer;
  if (!flaggedDelegate) {
    return (
      <div>
        <div className="text-sm font-medium text-slate-500">Admin</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Fraud Review</h1>
        <p className="mt-2 text-sm text-slate-600">
          The Fraud Review feature is not initialized yet. Run <span className="font-medium">npx prisma db push</span> and{" "}
          <span className="font-medium">npx prisma generate</span>, then restart the dev server.
        </p>
      </div>
    );
  }

  const flagged = await prisma.flaggedTransfer.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      fromAccount: true,
    },
    take: 50,
  });

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Admin</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Fraud Review</h1>
      <p className="mt-2 text-sm text-slate-600">Review flagged Interac e-Transfers and approve or reject.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium text-slate-600">
            <tr>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">From</th>
              <th className="px-5 py-3">To</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {flagged.length ? (
              flagged.map((f: (typeof flagged)[number]) => (
                <tr key={f.id} className="text-slate-700">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{f.user.name}</div>
                    <div className="text-xs text-slate-500">{f.user.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{labelAccountType(f.fromAccount.type)}</div>
                    <div className="text-xs text-slate-500">{f.fromAccount.accountNumber}</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">{f.toEmail}</td>
                  <td className="px-5 py-3">{new Date(f.createdAt).toLocaleString("en-CA")}</td>
                  <td className="px-5 py-3 text-right font-semibold text-red-600">-{formatMoney(f.amount)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <form action={approveFlaggedTransferAction}>
                        <input type="hidden" name="id" value={f.id} />
                        <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                          Approve
                        </button>
                      </form>
                      <form action={rejectFlaggedTransferAction}>
                        <input type="hidden" name="id" value={f.id} />
                        <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          Reject
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  No flagged transfers pending review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
