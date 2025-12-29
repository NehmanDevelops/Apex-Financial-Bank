"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftRight,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  Mail,
  PieChart,
  Receipt,
  Settings,
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type NavGroup = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: NavItem[];
};

const primary: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: CreditCard },
  { href: "/move-money", label: "Move Money", icon: ArrowLeftRight },
  { href: "/bill-pay", label: "Bill Pay", icon: Receipt },
];

const groups: NavGroup[] = [
  {
    id: "etransfer",
    label: "e-Transfer",
    icon: Mail,
    items: [
      { href: "/etransfer/send", label: "Send", icon: Mail },
      { href: "/etransfer/inbox", label: "Inbox", icon: Mail },
    ],
  },
  {
    id: "insights",
    label: "Insights & Cases",
    icon: PieChart,
    items: [
      { href: "/insights", label: "Insights", icon: PieChart },
      { href: "/disputes", label: "Disputes", icon: ShieldAlert },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: Receipt,
    items: [
      { href: "/admin/fraud", label: "Fraud Review", icon: Receipt },
      { href: "/test-board", label: "Test Board", icon: ClipboardCheck },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const initialOpen = useMemo(() => {
    const next: Record<string, boolean> = {
      etransfer: pathname.startsWith("/etransfer"),
      insights: pathname.startsWith("/insights") || pathname.startsWith("/disputes"),
      admin: pathname.startsWith("/admin") || pathname.startsWith("/test-board"),
    };
    return next;
  }, [pathname]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  return (
    <aside
      className={clsx(
        "flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white text-slate-900",
        className,
      )}
    >
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <Image src="/apexfinancial.png" alt="Apex Financial" width={28} height={28} priority className="rounded" />
          <div>
            <div className="text-base font-semibold tracking-tight">Apex Financial</div>
            <div className="mt-0.5 text-xs text-slate-500">Customer Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-50 hover:text-slate-900",
                  active ? "bg-slate-50 text-slate-900" : "text-slate-700",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2" />

          {groups.map((g) => {
            const GroupIcon = g.icon;
            const isOpen = open[g.id] ?? false;
            const activeGroup = g.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/"));

            return (
              <div key={g.id} className="rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [g.id]: !isOpen }))}
                  className={clsx(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold",
                    activeGroup ? "bg-slate-50 text-slate-900" : "text-slate-800 hover:bg-slate-50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <GroupIcon className="h-4 w-4" />
                    {g.label}
                  </span>
                  <ChevronDown className={clsx("h-4 w-4 text-slate-500 transition-transform", isOpen ? "rotate-180" : "")} />
                </button>

                {isOpen ? (
                  <div className="pb-2">
                    {g.items.map((item) => {
                      const Icon = item.icon;
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            "mx-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-50 hover:text-slate-900",
                            active ? "bg-slate-50 text-slate-900" : "text-slate-700",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          <Link
            href="/settings"
            className={clsx(
              "mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-slate-50 hover:text-slate-900",
              pathname === "/settings" ? "bg-slate-50 text-slate-900" : "text-slate-700",
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
      <div className="px-3 pb-3">
        <LogoutButton />
      </div>
      <div className="px-6 py-5 text-xs text-slate-500">© {new Date().getFullYear()} Apex Financial</div>
    </aside>
  );
}
