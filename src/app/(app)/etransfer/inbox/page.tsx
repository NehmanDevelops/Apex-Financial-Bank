"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ETransferInboxPage() {
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
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Inbox</h1>
      <p className="mt-2 text-sm text-slate-600">Pending e-Transfers waiting for you.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
            <div>
              <div className="font-medium text-slate-900">From: John Smith</div>
              <div className="text-sm text-slate-500">Received Dec 28</div>
            </div>
            <div className="font-semibold text-emerald-600">+$150.00</div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3">
            <div>
              <div className="font-medium text-slate-900">From: Jane Doe</div>
              <div className="text-sm text-slate-500">Received Dec 27</div>
            </div>
            <div className="font-semibold text-emerald-600">+$75.00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
