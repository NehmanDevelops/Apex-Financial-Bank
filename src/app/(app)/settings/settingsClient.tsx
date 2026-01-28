"use client";

import { useEffect, useMemo, useState } from "react";

type Result =
  | { ok: true; secret?: string }
  | {
    ok: false;
    message: string;
  };

type AccountOption = {
  id: string;
  label: string;
  accountNumber: string;
};

type DeviceRow = {
  id: string;
  label: string;
  lastSeenAt: string | null;
};

export function SettingsClient({
  autoDepositEnabled,
  autoDepositAccountId,
  accounts,
  mfaEnabled: initialMfaEnabled,
  mfaSecret: initialMfaSecret,
  devices: initialDevices,
}: {
  autoDepositEnabled: boolean;
  autoDepositAccountId: string;
  accounts: AccountOption[];
  mfaEnabled: boolean;
  mfaSecret: string | null;
  devices: DeviceRow[];
}) {
  // Mock action states for static export
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<Result | null>(null);

  const [startPending, setStartPending] = useState(false);
  const [startState, setStartState] = useState<Result | null>(null);

  const [confirmPending, setConfirmPending] = useState(false);
  const [confirmState, setConfirmState] = useState<Result | null>(null);

  const [disablePending, setDisablePending] = useState(false);
  const [disableState, setDisableState] = useState<Result | null>(null);

  const [removePending, setRemovePending] = useState(false);
  const [removeState, setRemoveState] = useState<Result | null>(null);

  const [mfaEnabled, setMfaEnabled] = useState(initialMfaEnabled);
  const [mfaSecret, setMfaSecret] = useState(initialMfaSecret);
  const [devices, setDevices] = useState(initialDevices);

  const action = async (formData: FormData) => {
    setPending(true);
    setState(null);
    await new Promise(resolve => setTimeout(resolve, 800));
    setState({ ok: true });
    setPending(false);
  };

  const startAction = async () => {
    setStartPending(true);
    setStartState(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStartState({ ok: true, secret: "MOCK-SECRET-123-456" });
    setStartPending(false);
  };

  const confirmAction = async (formData: FormData) => {
    setConfirmPending(true);
    setConfirmState(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMfaEnabled(true);
    setMfaSecret("MOCK-SECRET-123-456");
    setConfirmState({ ok: true });
    setConfirmPending(false);
  };

  const disableAction = async () => {
    setDisablePending(true);
    setDisableState(null);
    await new Promise(resolve => setTimeout(resolve, 800));
    setMfaEnabled(false);
    setMfaSecret(null);
    setDisableState({ ok: true });
    setDisablePending(false);
  };

  const removeAction = async (formData: FormData) => {
    setRemovePending(true);
    setRemoveState(null);
    await new Promise(resolve => setTimeout(resolve, 600));
    const id = String(formData.get("id") ?? "");
    setDevices(prev => prev.filter(d => d.id !== id));
    setRemoveState({ ok: true });
    setRemovePending(false);
  };
  const [toast, setToast] = useState<string | null>(null);

  const defaultAccountId = useMemo(() => autoDepositAccountId || accounts[0]?.id || "", [accounts, autoDepositAccountId]);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      setToast("Settings saved.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    const s = startState ?? confirmState ?? disableState ?? removeState;
    if (!s) return;
    if (s.ok) {
      setToast("Security updated.");
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [startState, confirmState, disableState, removeState]);

  return (
    <div className="max-w-2xl">
      <div className="text-sm font-medium text-slate-500">Settings</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Security & Preferences</h1>
      <p className="mt-2 text-sm text-slate-600">Manage autodeposit and other preferences.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form action={action} className="space-y-5">
          <div className="flex items-start gap-3">
            <input
              id="autoDepositEnabled"
              name="autoDepositEnabled"
              type="checkbox"
              defaultChecked={autoDepositEnabled}
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
            <div>
              <label htmlFor="autoDepositEnabled" className="text-sm font-semibold text-slate-900">
                Enable Autodeposit for e-Transfers
              </label>
              <div className="mt-1 text-xs text-slate-600">Incoming transfers will be deposited automatically.</div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Default deposit account</label>
            <select
              name="autoDepositAccountId"
              defaultValue={defaultAccountId}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
            >
              <option value="">Choose an account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} · {a.accountNumber}
                </option>
              ))}
            </select>
          </div>

          {state && !state.ok ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save settings"}
          </button>
        </form>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Two-step verification (MFA)</div>
        <div className="mt-1 text-xs text-slate-500">Use an authenticator app to generate a 6-digit code.</div>

        {!mfaEnabled ? (
          <div className="mt-4 space-y-4">
            <form action={startAction}>
              <button
                type="submit"
                disabled={startPending}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {startPending ? "Generating…" : "Start MFA setup"}
              </button>
            </form>

            {startState && startState.ok && startState.secret ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Setup secret</div>
                <div className="mt-1 text-xs text-slate-600">Add this secret in your authenticator app, then confirm with a code.</div>
                <div className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900">{startState.secret}</div>

                <form action={confirmAction} className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">6-digit code</label>
                    <input
                      name="code"
                      inputMode="numeric"
                      placeholder="123456"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-200 focus:ring-2"
                      required
                    />
                  </div>

                  {confirmState && !confirmState.ok ? (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{confirmState.message}</div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={confirmPending}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {confirmPending ? "Confirming…" : "Confirm MFA"}
                  </button>
                </form>
              </div>
            ) : mfaSecret ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Setup secret</div>
                <div className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900">{mfaSecret}</div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              MFA is enabled. Devices you trust won’t require a code again.
            </div>
            <form action={disableAction}>
              <button
                type="submit"
                disabled={disablePending}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                {disablePending ? "Disabling…" : "Disable MFA"}
              </button>
            </form>
            {disableState && !disableState.ok ? (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{disableState.message}</div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Trusted devices</div>
        <div className="mt-1 text-xs text-slate-500">Remove devices to require MFA again.</div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-600">
              <tr>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Last seen</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {devices.length ? (
                devices.map((d) => (
                  <tr key={d.id} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{d.label}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString("en-CA") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={removeAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <button
                          type="submit"
                          disabled={removePending}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-sm text-slate-500">
                    No trusted devices yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}
