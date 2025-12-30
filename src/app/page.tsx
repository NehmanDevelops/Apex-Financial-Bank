"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LandingClient } from "./LandingClient";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via localStorage
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn === "true") {
        router.push("/dashboard");
      } else {
        setIsChecking(false);
      }
    }
  }, [router]);

  // Show nothing while checking auth status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return <LandingClient />;
}
