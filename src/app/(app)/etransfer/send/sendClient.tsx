"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { sendETransfer } from "@/actions/eTransfer";

type AccountOption = {
  id: string;
  label: string;
  balance: number;
  accountNumber: string;
};

type ContactOption = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
};

type Result =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

const initialState: Result | null = null;

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function ETransferSendClient({
  accounts,
  contacts,
}: {
  accounts: AccountOption[];
  contacts: ContactOption[];
}) {
  const [state, action, pending] = useActionState(sendETransfer, initialState);
  const [toast, setToast] = useState<string | null>(null);
  const [toEmail, setToEmail] = useState<string>("");
  const [toPhone, setToPhone] = useState<string>("");
  const [autoDepositAvailable, setAutoDepositAvailable] = useState<boolean>(false);

  const defaultAccountId = useMemo(() => accounts[0]?.id ?? "", [accounts]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      setToast("e-Transfer sent successfully.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    const email = toEmail.trim();
    const phone = toPhone.trim();
    if (!email && !phone) {
      setAutoDepositAvailable(false);
      return;
    }

    const t = setTimeout(() => {
      const url = new URL("/api/etransfer/recipient", window.location.origin);
      if (email) url.searchParams.set("email", email);
      if (phone) url.searchParams.set("phone", phone);
      fetch(url)
        .then((r) => r.json())
        .then((data) => setAutoDepositAvailable(Boolean(data?.autoDepositEnabled)))
        .catch(() => setAutoDepositAvailable(false));
    }, 250);

    return () => clearTimeout(t);
  }, [toEmail, toPhone]);

  return (
    <div className="max-w-2xl">
      <div className="text-sm font-medium text-slate-500">Interac e-Transfer</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Send an e-Transfer</h1>
      <p className="mt-2 text-sm text-slate-600">Send money by email or phone number. Autodeposit will be applied when available.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={action} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">From Account</label>
            <select
              name="fromAccountId"
              defaultValue={defaultAccountId}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} · {a.accountNumber} · {formatMoney(a.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Recipient Email (optional)</label>
              <input
                name="toEmail"
                type="email"
                placeholder="friend@email.com"
                list="etransfer-contacts"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Recipient Phone (optional)</label>
              <input
                name="toPhone"
                placeholder="+1 416 555 0199"
                list="etransfer-phones"
                value={toPhone}
                onChange={(e) => setToPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              />
            </div>
          </div>

          <datalist id="etransfer-contacts">
            {contacts
              .filter((c) => c.email)
              .map((c) => (
                <option key={c.id} value={c.email ?? ""} />
              ))}
          </datalist>

          <datalist id="etransfer-phones">
            {contacts
              .filter((c) => c.phone)
              .map((c) => (
                <option key={c.id} value={c.phone ?? ""} />
              ))}
          </datalist>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Amount (CAD)</label>
              <input
                name="amount"
                inputMode="decimal"
                placeholder="50.00"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Memo (optional)</label>
              <input
                name="memo"
                placeholder="Dinner / Rent / Split"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
              />
            </div>
          </div>

          {!autoDepositAvailable ? (
            <div>
              <label className="text-sm font-medium text-slate-700">Security Question (required if no autodeposit)</label>
              <input
                name="securityQuestion"
                placeholder="What is the name of our first pet?"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                required
              />
            </div>
          ) : null}

          {state && !state.ok ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send e-Transfer"}
          </button>
        </form>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}
