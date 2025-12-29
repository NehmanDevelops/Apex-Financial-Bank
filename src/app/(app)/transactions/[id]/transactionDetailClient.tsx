"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { openDispute } from "@/actions/disputes";

type TxDTO = {
  id: string;
  description: string;
  merchant: string | null;
  memo: string | null;
  amount: number;
  type: "DEBIT" | "CREDIT";
  status: "POSTED" | "PENDING";
  date: string;
  accountNumber: string;
};

type DisputeDTO = {
  id: string;
  caseNumber: string;
  reason: string;
  status: string;
  comments: string | null;
  createdAt: string;
};

type Result =
  | { ok: true; caseNumber: string }
  | {
      ok: false;
      message: string;
    };

const initial: Result | null = null;

export function TransactionDetailClient({
  tx,
  dispute,
  displayAmount,
}: {
  tx: TxDTO;
  dispute: DisputeDTO | null;
  displayAmount: string;
}) {
  const [state, action, pending] = useActionState(openDispute, initial);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      setToast(`Case opened: ${state.caseNumber}`);
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  const canDispute = useMemo(() => !dispute, [dispute]);

  return (
    <div className="max-w-3xl">
      <div className="text-sm font-medium text-slate-500">Transaction</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Transaction details</h1>
      <p className="mt-2 text-sm text-slate-600">Review this transaction and report fraud or dispute a charge.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-5">
          <div className="text-sm font-semibold text-slate-900">{tx.description}</div>
          <div className="mt-1 text-xs text-slate-500">Account: {tx.accountNumber}</div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{tx.status}</span>
            <span className="text-xs text-slate-500">{new Date(tx.date).toLocaleString("en-CA")}</span>
          </div>
        </div>
        <div className="border-t border-slate-200 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-slate-500">Amount</div>
              <div className={"mt-1 text-lg font-semibold " + (tx.type === "CREDIT" ? "text-emerald-700" : "text-rose-700")}>{displayAmount}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Merchant</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{tx.merchant ?? "—"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-medium text-slate-500">Memo</div>
              <div className="mt-1 text-sm text-slate-700">{tx.memo ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Report an issue</div>
        <div className="mt-1 text-xs text-slate-500">Create a case number for fraud/dispute tracking.</div>

        {dispute ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Case {dispute.caseNumber}</div>
            <div className="mt-1 text-xs text-slate-600">Status: {dispute.status}</div>
            <div className="mt-1 text-xs text-slate-600">Reason: {dispute.reason}</div>
            <div className="mt-1 text-xs text-slate-600">Opened: {new Date(dispute.createdAt).toLocaleString("en-CA")}</div>
            <div className="mt-2 text-sm text-slate-700">{dispute.comments ?? "—"}</div>
          </div>
        ) : (
          <form action={action} className="mt-4 space-y-4">
            <input type="hidden" name="transactionId" value={tx.id} />

            <div>
              <label className="text-sm font-medium text-slate-700">Reason</label>
              <select
                name="reason"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              >
                <option value="">Select a reason...</option>
                <option value="FRAUD">Fraud</option>
                <option value="SERVICE_NOT_RECEIVED">Service not received</option>
                <option value="DUPLICATE">Duplicate transaction</option>
                <option value="INCORRECT_AMOUNT">Incorrect amount</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Comments</label>
              <textarea
                name="comments"
                placeholder="Add details (optional)"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                rows={4}
              />
            </div>

            {state && !state.ok ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div> : null}

            <button
              type="submit"
              disabled={pending || !canDispute}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Submitting..." : "Open case"}
            </button>
          </form>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}
