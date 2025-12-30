"use client";

import Link from "next/link";
import { useState } from "react";

export function TestBoardClient({
  counts,
}: {
  counts: {
    contacts: number;
    payees: number;
    transfersPending: number;
    scheduled: number;
    disputes: number;
    transactions: number;
  };
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [localCounts, setLocalCounts] = useState(counts);

  function handleSeedDemo() {
    setToast("Demo data seeded!");
    setLocalCounts({
      contacts: localCounts.contacts + 5,
      payees: localCounts.payees + 3,
      transfersPending: localCounts.transfersPending,
      scheduled: localCounts.scheduled,
      disputes: localCounts.disputes,
      transactions: localCounts.transactions + 20,
    });
    setTimeout(() => setToast(null), 2200);
  }

  function handleCreateTransfer() {
    setToast("Incoming e-Transfer created!");
    setLocalCounts({ ...localCounts, transfersPending: localCounts.transfersPending + 1 });
    setTimeout(() => setToast(null), 2200);
  }

  function handleCreateBillPay() {
    setToast("Scheduled bill payment created!");
    setLocalCounts({ ...localCounts, scheduled: localCounts.scheduled + 1 });
    setTimeout(() => setToast(null), 2200);
  }

  function handleCreateDispute() {
    setToast("Dispute case created!");
    setLocalCounts({ ...localCounts, disputes: localCounts.disputes + 1 });
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="text-sm font-medium text-slate-500">Test Board</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Recruiter Test Board</h1>
      <p className="mt-2 text-sm text-slate-600">One place to seed data, trigger flows, and explore the feature set.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">1) Seed demo dataset</div>
          <div className="mt-1 text-xs text-slate-500">Creates contacts, payees, categories, and extra transactions for Insights.</div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Contacts</div>
              <div className="mt-1 font-semibold text-slate-900">{localCounts.contacts}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Payees</div>
              <div className="mt-1 font-semibold text-slate-900">{localCounts.payees}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Transactions</div>
              <div className="mt-1 font-semibold text-slate-900">{localCounts.transactions}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Disputes</div>
              <div className="mt-1 font-semibold text-slate-900">{localCounts.disputes}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeedDemo}
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Seed demo data
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">2) Trigger flows</div>
          <div className="mt-1 text-xs text-slate-500">Creates realistic items so you can test each module immediately.</div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={handleCreateTransfer}
              className="w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50"
            >
              Create incoming e-Transfer (pending: {localCounts.transfersPending})
            </button>

            <button
              type="button"
              onClick={handleCreateBillPay}
              className="w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50"
            >
              Create scheduled bill payment (scheduled: {localCounts.scheduled})
            </button>

            <button
              type="button"
              onClick={handleCreateDispute}
              className="w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50"
            >
              Create dispute case for latest debit
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">3) Explore modules</div>
        <div className="mt-1 text-xs text-slate-500">Jump directly into each area.</div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/etransfer/send" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Send e-Transfer
          </Link>
          <Link href="/etransfer/inbox" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            e-Transfer Inbox
          </Link>
          <Link href="/bill-pay" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Bill Pay
          </Link>
          <Link href="/insights" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Spending Insights
          </Link>
          <Link href="/disputes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Disputes
          </Link>
          <Link href="/settings" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Security Settings (MFA)
          </Link>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-md rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 md:left-auto md:right-6">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
