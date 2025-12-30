"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MoveMoneyPage() {
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
      <div className="text-sm font-medium text-slate-500">Move Money</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Transfer Funds</h1>
      <p className="mt-2 text-sm text-slate-600">Move money between your accounts.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">From Account</label>
            <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option>Chequing - 000-1234567 ($4,520.50)</option>
              <option>Savings - 001-7654321 ($12,400.00)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">To Account</label>
            <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option>Savings - 001-7654321 ($12,400.00)</option>
              <option>Chequing - 000-1234567 ($4,520.50)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Amount</label>
            <input type="number" placeholder="0.00" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <button className="w-full rounded-lg bg-[#0b6aa9] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#095f98]">
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
