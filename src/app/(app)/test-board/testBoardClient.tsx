"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createDisputeDemo, createIncomingETransferDemo, createScheduledBillPayDemo, seedTestBoard } from "@/actions/testBoard";

type Result =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

const initial: Result | null = null;

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
  const [seedState, seedAction, seedPending] = useActionState(seedTestBoard, initial);
  const [xferState, xferAction, xferPending] = useActionState(createIncomingETransferDemo, initial);
  const [billState, billAction, billPending] = useActionState(createScheduledBillPayDemo, initial);
  const [dispState, dispAction, dispPending] = useActionState(createDisputeDemo, initial);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const s = seedState ?? xferState ?? billState ?? dispState;
    if (!s) return;
    if (s.ok) {
      setToast("Done.");
      const t = setTimeout(() => setToast(null), 2200);
      return () => clearTimeout(t);
    }
  }, [seedState, xferState, billState, dispState]);

  const error = (seedState && !seedState.ok && seedState.message) || (xferState && !xferState.ok && xferState.message) || (billState && !billState.ok && billState.message) || (dispState && !dispState.ok && dispState.message) || null;

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
              <div className="mt-1 font-semibold text-slate-900">{counts.contacts}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Payees</div>
              <div className="mt-1 font-semibold text-slate-900">{counts.payees}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Transactions</div>
              <div className="mt-1 font-semibold text-slate-900">{counts.transactions}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Disputes</div>
              <div className="mt-1 font-semibold text-slate-900">{counts.disputes}</div>
            </div>
          </div>

          <form action={seedAction} className="mt-4">
            <button
              type="submit"
              disabled={seedPending}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {seedPending ? "Seeding…" : "Seed demo data"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">2) Trigger flows</div>
          <div className="mt-1 text-xs text-slate-500">Creates realistic items so you can test each module immediately.</div>

          <div className="mt-4 space-y-3">
            <form action={xferAction}>
              <button
                type="submit"
                disabled={xferPending}
                className="w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                {xferPending ? "Creating…" : `Create incoming e-Transfer (pending: ${counts.transfersPending})`}
              </button>
            </form>

            <form action={billAction}>
              <button
                type="submit"
                disabled={billPending}
                className="w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                {billPending ? "Creating…" : `Create scheduled bill payment (scheduled: ${counts.scheduled})`}
              </button>
            </form>

            <form action={dispAction}>
              <button
                type="submit"
                disabled={dispPending}
                className="w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                {dispPending ? "Creating…" : "Create dispute case for latest debit"}
              </button>
            </form>
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

      {error ? <div className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      {toast ? (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-md rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 md:left-auto md:right-6">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
