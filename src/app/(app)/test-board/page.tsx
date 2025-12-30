"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TestBoardClient } from "./testBoardClient";

// Demo counts
const demoCounts = {
  contacts: 3,
  payees: 5,
  transfersPending: 2,
  scheduled: 1,
  disputes: 0,
  transactions: 15,
};

export default function TestBoardPage() {
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

  return <TestBoardClient counts={demoCounts} />;
}
