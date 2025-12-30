"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransactionDetailPage() {
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
      <div className="text-sm font-medium text-slate-500">Transaction</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Transaction Details</h1>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-500">Description</span>
            <span className="font-medium text-slate-900">Starbucks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount</span>
            <span className="font-medium text-red-600">-$8.45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-medium text-slate-900">Dec 26, 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">POSTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
