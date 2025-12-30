"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getETransfers, depositETransfer, DemoETransfer } from "@/lib/demoStore";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function ETransferInboxPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [transfers, setTransfers] = useState<DemoETransfer[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }
      setTransfers(getETransfers());
      setIsLoaded(true);
    }
  }, [router]);

  function handleDeposit(transfer: DemoETransfer) {
    depositETransfer(transfer.id);
    setTransfers(getETransfers());
    setToast(`Deposited ${formatMoney(transfer.amount)} from ${transfer.fromName}!`);
    setTimeout(() => setToast(null), 3000);
  }

  if (!isLoaded) {
    return <div className="py-20 text-center text-slate-500">Loading...</div>;
  }

  const pending = transfers.filter(t => t.status === "PENDING");
  const deposited = transfers.filter(t => t.status === "DEPOSITED");

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">e-Transfer</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Inbox</h1>
      <p className="mt-2 text-sm text-slate-600">Pending e-Transfers waiting for you to deposit.</p>

      <div className="mt-8 space-y-6">
        {pending.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Pending ({pending.length})</h2>
            <div className="mt-4 space-y-3">
              {pending.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">From: {t.fromName}</div>
                    <div className="text-sm text-slate-500">
                      Received {new Date(t.date).toLocaleDateString("en-CA")}
                      {t.message && <span> • &quot;{t.message}&quot;</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-emerald-600">{formatMoney(t.amount)}</div>
                    <button
                      onClick={() => handleDeposit(t)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Deposit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="text-4xl">📬</div>
              <div className="mt-4 text-lg font-medium text-slate-900">No Pending Transfers</div>
              <div className="mt-2 text-sm text-slate-500">You&apos;re all caught up!</div>
            </div>
          </div>
        )}

        {deposited.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recently Deposited ({deposited.length})</h2>
            <div className="mt-4 space-y-3">
              {deposited.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">From: {t.fromName}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(t.date).toLocaleDateString("en-CA")}
                    </div>
                  </div>
                  <div className="font-semibold text-slate-600">{formatMoney(t.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-md rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 md:left-auto md:right-6">
          {toast}
        </div>
      )}
    </div>
  );
}
