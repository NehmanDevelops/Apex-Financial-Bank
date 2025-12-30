"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DisputesPage() {
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
      <div className="text-sm font-medium text-slate-500">Disputes</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Transaction Disputes</h1>
      <p className="mt-2 text-sm text-slate-600">Manage and track your dispute cases.</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="text-4xl">✓</div>
          <div className="mt-4 text-lg font-medium text-slate-900">No Active Disputes</div>
          <div className="mt-2 text-sm text-slate-500">You don&apos;t have any pending disputes.</div>
        </div>
      </div>
    </div>
  );
}
