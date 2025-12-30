"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDemoCounts,
  seedDemoData,
  addETransfer,
  addBillPayment,
  addDispute,
  getLatestDebit
} from "@/lib/demoStore";

export function TestBoardClient({
  counts: initialCounts,
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
  const [counts, setCounts] = useState(initialCounts);

  // Refresh counts from localStorage on mount
  useEffect(() => {
    setCounts(getDemoCounts());
  }, []);

  function refreshCounts() {
    setCounts(getDemoCounts());
  }

  function handleSeedDemo() {
    seedDemoData();
    refreshCounts();
    setToast("Demo data seeded! Added 5 contacts, 3 payees, and 5 transactions.");
    setTimeout(() => setToast(null), 3000);
  }

  function handleCreateTransfer() {
    const names = ["Alex Brown", "Maria Garcia", "Chris Lee", "Jordan Taylor", "Sam Wilson"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAmount = Math.floor(Math.random() * 500) + 50;

    addETransfer({
      fromName: randomName,
      amount: randomAmount,
      date: new Date().toISOString(),
      status: "PENDING",
      message: "Here you go!",
    });

    refreshCounts();
    setToast(`Created incoming e-Transfer of $${randomAmount} from ${randomName}!`);
    setTimeout(() => setToast(null), 3000);
  }

  function handleCreateBillPay() {
    const payees = ["Bell Canada", "Enbridge Gas", "TD Insurance", "City of Ottawa", "CIBC"];
    const randomPayee = payees[Math.floor(Math.random() * payees.length)];
    const randomAmount = Math.floor(Math.random() * 200) + 50;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 7);

    addBillPayment({
      payee: randomPayee,
      amount: randomAmount,
      dueDate: futureDate.toISOString().split("T")[0],
      status: "SCHEDULED",
    });

    refreshCounts();
    setToast(`Created scheduled bill payment of $${randomAmount} to ${randomPayee}!`);
    setTimeout(() => setToast(null), 3000);
  }

  function handleCreateDispute() {
    const latestDebit = getLatestDebit();
    if (latestDebit) {
      addDispute({
        transactionDescription: latestDebit.description,
        amount: latestDebit.amount,
        date: new Date().toISOString(),
        status: "OPEN",
        reason: "Unrecognized transaction",
      });
      refreshCounts();
      setToast(`Created dispute for "${latestDebit.description}" ($${latestDebit.amount.toFixed(2)})!`);
    } else {
      setToast("No debit transactions found to dispute!");
    }
    setTimeout(() => setToast(null), 3000);
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
              Create incoming e-Transfer (pending: {counts.transfersPending})
            </button>

            <button
              type="button"
              onClick={handleCreateBillPay}
              className="w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-slate-900 hover:bg-slate-50"
            >
              Create scheduled bill payment (scheduled: {counts.scheduled})
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
