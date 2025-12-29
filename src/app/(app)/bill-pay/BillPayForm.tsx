"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { addPayee, processBillPay, runScheduledPayments, scheduleBillPayment } from "@/actions/billPay";

type AccountOption = {
  id: string;
  label: string;
  balance: number;
  accountNumber: string;
};

type BillPayResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

type PayeeResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

type ScheduleResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

const initialState: BillPayResult | null = null;
const initialPayeeState: PayeeResult | null = null;
const initialScheduleState: ScheduleResult | null = null;

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

type PayeeOption = { id: string; name: string };
type UpcomingPayment = {
  id: string;
  payeeName: string;
  amount: number;
  nextRunAt: string;
  status: string;
  frequency: string;
  fromAccountNumber: string;
};

export function BillPayForm({
  accounts,
  payees,
  upcoming,
}: {
  accounts: AccountOption[];
  payees: PayeeOption[];
  upcoming: UpcomingPayment[];
}) {
  const [state, action, pending] = useActionState(processBillPay, initialState);
  const [payeeState, payeeAction, payeePending] = useActionState(addPayee, initialPayeeState);
  const [scheduleState, scheduleAction, schedulePending] = useActionState(scheduleBillPayment, initialScheduleState);
  const [runState, runAction, runPending] = useActionState(runScheduledPayments, null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      setToast("Payment submitted successfully.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    if (!payeeState) return;
    if (payeeState.ok) {
      setToast("Payee added.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [payeeState]);

  useEffect(() => {
    if (!scheduleState) return;
    if (scheduleState.ok) {
      setToast("Payment scheduled.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [scheduleState]);

  useEffect(() => {
    if (!runState) return;
    setToast("Scheduled payments processed.");
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [runState]);

  const defaultAccountId = useMemo(() => accounts[0]?.id ?? "", [accounts]);
  const defaultPayeeId = useMemo(() => payees[0]?.id ?? "", [payees]);

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="text-sm font-medium text-slate-500">Bill Pay</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Bill Payments</h1>
      <p className="mt-2 text-sm text-slate-600">Pay common billers directly from your chequing or savings.</p>

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

          <div>
            <label className="text-sm font-medium text-slate-700">Payee</label>
            <select
              name="payeeId"
              defaultValue={defaultPayeeId}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              required
            >
              <option value="">Select a payee...</option>
              {payees.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Amount (CAD)</label>
              <input
                name="amount"
                inputMode="decimal"
                placeholder="125.00"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Reference (optional)</label>
              <input
                name="reference"
                placeholder="Account # / Invoice #"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              />
            </div>
          </div>

          {state && !state.ok ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Submitting..." : "Pay Bill"}
          </button>
        </form>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Manage payees</div>
          <div className="mt-1 text-xs text-slate-500">Add and reuse billers like Hydro, Rogers, CRA, and more.</div>

          <form action={payeeAction} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Payee name</label>
              <input
                name="name"
                placeholder="Hydro One"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Payee code (optional)</label>
              <input
                name="payeeCode"
                placeholder="HYDRO"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              />
            </div>

            {payeeState && !payeeState.ok ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{payeeState.message}</div>
            ) : null}

            <button
              type="submit"
              disabled={payeePending}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              {payeePending ? "Adding..." : "Add payee"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Schedule a payment</div>
          <div className="mt-1 text-xs text-slate-500">Set up one-time or recurring payments and track upcoming dates.</div>

          <form action={scheduleAction} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">From account</label>
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

            <div>
              <label className="text-sm font-medium text-slate-700">Payee</label>
              <select
                name="payeeId"
                defaultValue={defaultPayeeId}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              >
                <option value="">Select a payee...</option>
                {payees.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Amount (CAD)</label>
                <input
                  name="amount"
                  inputMode="decimal"
                  placeholder="125.00"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Payment date</label>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={today}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Frequency</label>
              <select
                name="frequency"
                defaultValue="ONE_TIME"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              >
                <option value="ONE_TIME">One-time</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Reference (optional)</label>
              <input
                name="reference"
                placeholder="Account # / Invoice #"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              />
            </div>

            {scheduleState && !scheduleState.ok ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{scheduleState.message}</div>
            ) : null}

            <button
              type="submit"
              disabled={schedulePending}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {schedulePending ? "Scheduling..." : "Schedule payment"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Upcoming scheduled payments</div>
            <div className="mt-1 text-xs text-slate-500">Shows scheduled and failed payments. Use “Run” to process due ones in the demo.</div>
          </div>
          <form action={runAction}>
            <button
              type="submit"
              disabled={runPending}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              {runPending ? "Running..." : "Run scheduled payments"}
            </button>
          </form>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-600">
              <tr>
                <th className="px-4 py-3">Payee</th>
                <th className="px-4 py-3">Next date</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {upcoming.length ? (
                upcoming.map((p) => (
                  <tr key={p.id} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.payeeName}</td>
                    <td className="px-4 py-3">{new Date(p.nextRunAt).toLocaleDateString("en-CA")}</td>
                    <td className="px-4 py-3">{p.frequency}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatMoney(p.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                    No scheduled payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
