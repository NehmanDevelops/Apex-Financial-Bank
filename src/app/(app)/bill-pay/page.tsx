"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBillPayments, DemoBillPayment } from "@/lib/demoStore";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function BillPayPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [bills, setBills] = useState<DemoBillPayment[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }
      setBills(getBillPayments());
      setIsLoaded(true);
    }
  }, [router]);

  if (!isLoaded) {
    return <div className="py-20 text-center text-slate-500">Loading...</div>;
  }

  const scheduled = bills.filter(b => b.status === "SCHEDULED");
  const paid = bills.filter(b => b.status === "PAID");

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Bill Pay</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Pay Bills</h1>
      <p className="mt-2 text-sm text-slate-600">Pay your bills and manage payees.</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Bills ({scheduled.length})</h2>
          {scheduled.length > 0 ? (
            <div className="mt-4 space-y-3">
              {scheduled.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{bill.payee}</div>
                    <div className="text-sm text-slate-500">Due {bill.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-amber-700">{formatMoney(bill.amount)}</div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-center py-6 text-slate-500">
              No upcoming bills scheduled.
            </div>
          )}
        </div>

        {paid.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recently Paid ({paid.length})</h2>
            <div className="mt-4 space-y-3">
              {paid.slice(0, 5).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{bill.payee}</div>
                    <div className="text-sm text-slate-500">{bill.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-slate-600">{formatMoney(bill.amount)}</div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Paid
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
