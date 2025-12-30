"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
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
      <div className="text-sm font-medium text-slate-500">Settings</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
      <p className="mt-2 text-sm text-slate-600">Manage your account preferences.</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input type="text" defaultValue="Demo User" className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" defaultValue="demo@apex.ca" className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" disabled />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          <p className="mt-2 text-sm text-slate-600">Two-factor authentication and trusted devices.</p>
          <div className="mt-4">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              2FA Disabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
