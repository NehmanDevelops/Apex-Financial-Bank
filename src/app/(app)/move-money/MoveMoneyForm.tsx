"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { processTransfer } from "@/actions/transfer";

type AccountOption = {
  id: string;
  label: string;
  balance: number;
  accountNumber: string;
};

type TransferResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

const initialState: TransferResult | null = null;

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function MoveMoneyForm({ accounts }: { accounts: AccountOption[] }) {
  const [state, action, pending] = useActionState(processTransfer, initialState);

  const [toast, setToast] = useState<string | null>(null);
  const [showFraudModal, setShowFraudModal] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      setToast("Transfer sent successfully.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }

    if (!state.ok && state.message.includes("Code: 99")) {
      setShowFraudModal(true);
    }
  }, [state]);

  const defaultAccountId = useMemo(() => accounts[0]?.id ?? "", [accounts]);

  return (
    <div className="max-w-2xl">
      <div className="text-sm font-medium text-slate-500">Move Money</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Interac e-Transfer</h1>
      <p className="mt-2 text-sm text-slate-600">Send money securely and get real-time balance updates.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={action} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">From Account</label>
            <select
              name="fromAccountId"
              defaultValue={defaultAccountId}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} · {a.accountNumber} · {formatMoney(a.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">To Email</label>
              <input
                name="toEmail"
                type="email"
                placeholder="friend@email.com"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Amount (CAD)</label>
              <input
                name="amount"
                inputMode="decimal"
                placeholder="50.00"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              />
              <div className="mt-1 text-xs text-slate-500">Fraud rule: transfers over $5,000 are blocked.</div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Security Question</label>
            <input
              name="securityQuestion"
              placeholder="What is the name of our first pet?"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              required
            />
          </div>

          {state && !state.ok ? (
            state.message.includes("Code: 99") ? null : (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div>
            )
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send Money"}
          </button>
        </form>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {showFraudModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-sm font-medium text-slate-500">Security Alert</div>
            <div className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Transaction flagged</div>
            <div className="mt-2 text-sm text-slate-600">
              This transfer was flagged for security review and has been routed to the Fraud Review queue.
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{state && !state.ok ? state.message : null}</div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFraudModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <a
                href="/admin/fraud"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Fraud Queue
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
