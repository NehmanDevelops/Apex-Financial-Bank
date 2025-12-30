"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    if (typeof window !== "undefined") {
      // Clear demo session
      localStorage.removeItem("demo-logged-in");
      localStorage.removeItem("demo-user");
      // Redirect to login
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </button>
  );
}
