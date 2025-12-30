"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { QuickActions } from "@/components/QuickActions";
import { Menu, X } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check localStorage for demo session
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn === "true") {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-16 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg border border-slate-200"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 bg-slate-50 dark:bg-slate-900">
        {/* Sidebar - hidden on mobile, shown on lg+ */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar className="h-full" />
        </div>

        <div className="flex-1 w-full">
          {/* Responsive padding - smaller on mobile */}
          <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </div>
      </div>
      <Footer />
      <QuickActions />
    </div>
  );
}
