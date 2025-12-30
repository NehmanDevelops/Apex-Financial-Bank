"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InsightsPage() {
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
      <div className="text-sm font-medium text-slate-500">Insights</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Spending Insights</h1>
      <p className="mt-2 text-sm text-slate-600">Track your spending and budget progress.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">This Month</h2>
          <div className="mt-4 text-3xl font-bold text-slate-900">$1,245.67</div>
          <div className="mt-1 text-sm text-slate-500">Total spending</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Budget Status</h2>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Used</span>
              <span className="font-medium text-slate-900">62%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 w-[62%] rounded-full bg-[#0b6aa9]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
