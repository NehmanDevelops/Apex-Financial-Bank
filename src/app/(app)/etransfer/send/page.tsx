"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getContacts, addETransfer, DemoContact } from "@/lib/demoStore";
import { Check, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

type Step = "form" | "confirm" | "success";

export default function ETransferSendPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [contacts, setContacts] = useState<DemoContact[]>([]);
  const [step, setStep] = useState<Step>("form");

  // Form fields
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("demo-logged-in");
      if (loggedIn !== "true") {
        router.push("/login");
        return;
      }
      setContacts(getContacts());
      setIsLoaded(true);
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!recipient.trim()) {
      setError("Please enter a recipient email");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > 3000) {
      setError("Maximum e-Transfer amount is $3,000");
      return;
    }

    setStep("confirm");
  }

  function handleConfirm() {
    // Create the outgoing transfer record
    addETransfer({
      fromName: "Demo User (You)",
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      status: "PENDING",
      message: message || undefined,
    });

    setStep("success");
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Transfer Sent!</h1>
          <p className="mt-2 text-slate-600">
            {formatMoney(parseFloat(amount))} has been sent to {recipient}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/etransfer/inbox"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View Inbox
            </Link>
            <button
              onClick={() => {
                setRecipient("");
                setAmount("");
                setMessage("");
                setStep("form");
              }}
              className="rounded-lg bg-[#0b6aa9] px-4 py-2 text-sm font-medium text-white hover:bg-[#095f98]"
            >
              Send Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="mx-auto max-w-md">
        <button
          onClick={() => setStep("form")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Confirm Transfer</h1>
          <p className="mt-1 text-sm text-slate-500">Review the details below</p>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">To</span>
              <span className="font-medium text-slate-900">{recipient}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Amount</span>
              <span className="text-xl font-bold text-slate-900">{formatMoney(parseFloat(amount))}</span>
            </div>
            {message && (
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Message</span>
                <span className="font-medium text-slate-900">{message}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">From</span>
              <span className="font-medium text-slate-900">Chequing •••• 4567</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Send className="h-4 w-4" />
            Send {formatMoney(parseFloat(amount))}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-sm font-medium text-slate-500">e-Transfer</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Send Money</h1>
      <p className="mt-2 text-sm text-slate-600">Send an Interac e-Transfer to anyone.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">Recipient Email</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#0b6aa9] focus:outline-none focus:ring-1 focus:ring-[#0b6aa9]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Amount</label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    max="3000"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-4 py-3 text-sm focus:border-[#0b6aa9] focus:outline-none focus:ring-1 focus:ring-[#0b6aa9]"
                  />
                </div>
                <div className="mt-1 text-xs text-slate-400">Maximum: $3,000 per transfer</div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Message (optional)</label>
                <input
                  type="text"
                  placeholder="What's this for?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#0b6aa9] focus:outline-none focus:ring-1 focus:ring-[#0b6aa9]"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b6aa9] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#095f98] transition-colors"
              >
                <Send className="h-4 w-4" />
                Continue
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="font-semibold text-slate-900">Recent Contacts</h2>
          <div className="mt-4 space-y-2">
            {contacts.slice(0, 5).map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => setRecipient(contact.email)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{contact.name}</div>
                  <div className="text-xs text-slate-500">{contact.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
