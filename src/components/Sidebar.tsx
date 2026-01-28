"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../../public/apexfinancial.png";
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
import { useEffect, useMemo, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";

type NavItem = {
  href: string;
  labelEn: string;
  labelFr: string;
  icon: ComponentType<{ className?: string }>;
};

type NavGroup = {
  id: string;
  labelEn: string;
  labelFr: string;
  icon: ComponentType<{ className?: string }>;
  items: NavItem[];
};

const primary: NavItem[] = [
  { href: "/dashboard", labelEn: "Dashboard", labelFr: "Tableau de bord", icon: LayoutDashboard },
  { href: "/accounts", labelEn: "Accounts", labelFr: "Comptes", icon: CreditCard },
  { href: "/move-money", labelEn: "Move Money", labelFr: "Transférer", icon: ArrowLeftRight },
  { href: "/bill-pay", labelEn: "Bill Pay", labelFr: "Factures", icon: Receipt },
];

const groups: NavGroup[] = [
  {
    id: "etransfer",
    labelEn: "e-Transfer",
    labelFr: "Virement",
    icon: Mail,
    items: [
      { href: "/etransfer/send", labelEn: "Send", labelFr: "Envoyer", icon: Mail },
      { href: "/etransfer/inbox", labelEn: "Inbox", labelFr: "Boîte de réception", icon: Mail },
    ],
  },
  {
    id: "insights",
    labelEn: "Insights & Cases",
    labelFr: "Analyses & Cas",
    icon: PieChart,
    items: [
      { href: "/insights", labelEn: "Insights", labelFr: "Analyses", icon: PieChart },
      { href: "/disputes", labelEn: "Disputes", labelFr: "Litiges", icon: ShieldAlert },
    ],
  },
  {
    id: "admin",
    labelEn: "Admin",
    labelFr: "Admin",
    icon: Receipt,
    items: [
      { href: "/admin/fraud", labelEn: "Fraud Review", labelFr: "Révision fraude", icon: Receipt },
      { href: "/test-board", labelEn: "Test Board", labelFr: "Tableau de test", icon: ClipboardCheck },
    ],
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<"en" | "fr">("en");

  useEffect(() => {
    const saved = localStorage.getItem("apex_lang") as "en" | "fr" | null;
    if (saved === "fr" || saved === "en") {
      setLang(saved);
    }
  }, []);

  const getLabel = (item: NavItem | NavGroup) => {
    return lang === "fr" ? item.labelFr : item.labelEn;
  };

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
          <Image src={logo} alt="Apex Financial" width={28} height={28} priority className="rounded" />
          <div>
            <div className="text-base font-semibold tracking-tight">Apex Financial</div>
            <div className="mt-0.5 text-xs text-slate-500">
              {lang === "fr" ? "Portail client" : "Customer Portal"}
            </div>
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
                <span>{getLabel(item)}</span>
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
                    {getLabel(g)}
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
                          <span>{getLabel(item)}</span>
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
            <span>{lang === "fr" ? "Paramètres" : "Settings"}</span>
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
