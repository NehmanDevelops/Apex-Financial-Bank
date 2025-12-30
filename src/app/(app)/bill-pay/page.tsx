"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BillPayPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }
      setIsLoaded(true);
    }
  }, [router]);

  if (!isLoaded) {
    return <div className="py-20 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">Bill Pay</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Pay Bills</h1>
      <p className="mt-2 text-sm text-slate-600">Pay your bills and manage payees.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Bills</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <div>
              <div className="font-medium text-slate-900">Hydro Ottawa</div>
              <div className="text-sm text-slate-500">Due Jan 15</div>
            </div>
            <div className="font-semibold text-slate-900">$112.66</div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <div>
              <div className="font-medium text-slate-900">Rogers Wireless</div>
              <div className="text-sm text-slate-500">Due Jan 20</div>
            </div>
            <div className="font-semibold text-slate-900">$85.00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
