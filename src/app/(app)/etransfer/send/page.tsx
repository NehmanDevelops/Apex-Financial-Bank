"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ETransferSendPage() {
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
      <div className="text-sm font-medium text-slate-500">e-Transfer</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Send Money</h1>
      <p className="mt-2 text-sm text-slate-600">Send an Interac e-Transfer to anyone.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Recipient Email</label>
            <input type="email" placeholder="name@email.com" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Amount</label>
            <input type="number" placeholder="0.00" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Message (optional)</label>
            <input type="text" placeholder="What's this for?" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <button className="w-full rounded-lg bg-[#0b6aa9] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#095f98]">
            Send e-Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
