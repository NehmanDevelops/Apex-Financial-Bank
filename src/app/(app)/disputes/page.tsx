"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDisputes, DemoDispute } from "@/lib/demoStore";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function DisputesPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [disputes, setDisputes] = useState<DemoDispute[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }
      setDisputes(getDisputes());
      setIsLoaded(true);
    }
  }, [router]);

  if (!isLoaded) {
    return <div className="py-20 text-center text-slate-500">Loading...</div>;
  }

  const open = disputes.filter(d => d.status === "OPEN");
  const resolved = disputes.filter(d => d.status === "RESOLVED");

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Disputes</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Transaction Disputes</h1>
      <p className="mt-2 text-sm text-slate-600">Manage and track your dispute cases.</p>

      <div className="mt-8 space-y-6">
        {open.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Open Disputes ({open.length})</h2>
            <div className="mt-4 space-y-3">
              {open.map((dispute) => (
                <div key={dispute.id} className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{dispute.transactionDescription}</div>
                    <div className="text-sm text-slate-500">
                      Opened {new Date(dispute.date).toLocaleDateString("en-CA")} • {dispute.reason}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-red-600">{formatMoney(dispute.amount)}</div>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Open
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="text-4xl">✓</div>
              <div className="mt-4 text-lg font-medium text-slate-900">No Active Disputes</div>
              <div className="mt-2 text-sm text-slate-500">You don&apos;t have any pending disputes.</div>
            </div>
          </div>
        )}

        {resolved.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Resolved ({resolved.length})</h2>
            <div className="mt-4 space-y-3">
              {resolved.slice(0, 5).map((dispute) => (
                <div key={dispute.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{dispute.transactionDescription}</div>
                    <div className="text-sm text-slate-500">{new Date(dispute.date).toLocaleDateString("en-CA")}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-slate-600">{formatMoney(dispute.amount)}</div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Resolved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
