"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { acceptETransfer, declineETransfer } from "@/actions/eTransfer";

type AccountOption = {
  id: string;
  label: string;
  balance: number;
  accountNumber: string;
};

type TransferRow = {
  id: string;
  status: string;
  amount?: number;
  amountText: string;
  fromAccountId?: string;
  toEmail: string | null;
  toPhone: string | null;
  memo: string | null;
  createdAt: string;
  fromName?: string | null;
  fromEmail?: string | null;
};

type Result =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

const initialState: Result | null = null;

export function ETransferInboxClient({
  accounts,
  incoming,
  sent,
  autoDepositEnabled,
  defaultDepositAccountId,
}: {
  accounts: AccountOption[];
  incoming: TransferRow[];
  sent: TransferRow[];
  autoDepositEnabled: boolean;
  defaultDepositAccountId: string | null;
}) {
  const [acceptState, acceptAction, acceptPending] = useActionState(acceptETransfer, initialState);
  const [declineState, declineAction, declinePending] = useActionState(declineETransfer, initialState);
  const [toast, setToast] = useState<string | null>(null);

  const defaultAccountId = useMemo(() => defaultDepositAccountId ?? accounts[0]?.id ?? "", [accounts, defaultDepositAccountId]);

  useEffect(() => {
    const s = acceptState ?? declineState;
    if (!s) return;
    if (s.ok) {
      setToast("Update successful.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [acceptState, declineState]);

  return (
    <div className="space-y-10">
      <div>
        <div className="text-sm font-medium text-slate-500">Interac e-Transfer</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Inbox</h1>
        <p className="mt-2 text-sm text-slate-600">Review incoming transfers and track what you’ve sent.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Incoming</div>
            <div className="mt-1 text-xs text-slate-500">Autodeposit: {autoDepositEnabled ? "On" : "Off"}</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {incoming.length ? (
            incoming.map((t) => {
              const pending = t.status === "PENDING";
              const chipClass =
                t.status === "DEPOSITED"
                  ? "bg-emerald-50 text-emerald-700"
                  : t.status === "DECLINED"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-slate-100 text-slate-700";
              return (
                <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{t.amountText}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className={"inline-flex rounded-full px-2 py-0.5 font-medium " + chipClass}>{t.status}</span>
                        <span>{new Date(t.createdAt).toLocaleString("en-CA")}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">From: {t.fromName || t.fromEmail || "—"}</div>
                      <div className="mt-1 text-xs text-slate-600">Memo: {t.memo || "—"}</div>
                    </div>

                    {pending ? (
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <form action={acceptAction} className="flex items-center gap-2">
                          <input type="hidden" name="eTransferId" value={t.id} />
                          <select
                            name="depositAccountId"
                            defaultValue={defaultAccountId}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                          >
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.label} · {a.accountNumber}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            disabled={acceptPending}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {acceptPending ? "Accepting..." : "Accept"}
                          </button>
                        </form>

                        <form action={declineAction}>
                          <input type="hidden" name="eTransferId" value={t.id} />
                          <button
                            type="submit"
                            disabled={declinePending}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            {declinePending ? "Declining..." : "Decline"}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-slate-600">No incoming e-Transfers yet.</div>
          )}

          {acceptState && !acceptState.ok ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{acceptState.message}</div>
          ) : null}
          {declineState && !declineState.ok ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{declineState.message}</div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Sent</div>
        <div className="mt-4 space-y-3">
          {sent.length ? (
            sent.map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.amountText}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      To: {t.toEmail || t.toPhone || "—"} · Status: {t.status}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">Memo: {t.memo || "—"}</div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString("en-CA")}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-600">No sent e-Transfers yet.</div>
          )}
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}
