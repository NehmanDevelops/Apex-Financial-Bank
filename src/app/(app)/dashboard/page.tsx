"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

// Demo data for the dashboard
const demoAccounts = [
  { id: "1", type: "CHEQUING", balance: 4520.50, accountNumber: "000-1234567" },
  { id: "2", type: "SAVINGS", balance: 12400.00, accountNumber: "001-7654321" },
  { id: "3", type: "CREDIT_CARD", balance: -450.23, accountNumber: "VISA-4381" },
];

const demoTransactions = [
  { id: "1", amount: 2860.00, type: "CREDIT", description: "Payroll Deposit", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
  { id: "2", amount: 8.45, type: "DEBIT", description: "Starbucks", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
  { id: "3", amount: 24.18, type: "DEBIT", description: "Uber", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
  { id: "4", amount: 112.66, type: "DEBIT", description: "Hydro Bill", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
  { id: "5", amount: 75.00, type: "DEBIT", description: "Interac e-Transfer", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: "PENDING", accountType: "CHEQUING" },
  { id: "6", amount: 500.00, type: "CREDIT", description: "Monthly Savings Transfer", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "SAVINGS" },
  { id: "7", amount: 61.92, type: "DEBIT", description: "Amazon Marketplace", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CREDIT_CARD" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Demo User");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }

      const userStr = localStorage.getItem("demo-user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || "Demo User");
        } catch { }
      }
      setIsLoaded(true);
    }
  }, [router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <DashboardClient
      name={userName}
      showTestBoard={true}
      accounts={demoAccounts}
      transactions={demoTransactions}
    />
  );
}
