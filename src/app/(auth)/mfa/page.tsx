"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

type Result =
  | { ok: true }
  | {
    ok: false;
    message: string;
  };

export function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  // Mock action state for static export
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<Result | null>(null);

  const action = async (formData: FormData) => {
    setPending(true);
    setState(null);

    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Success mock - accept any 6 digits
    setState({ ok: true });
    setPending(false);
  };
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      router.push(callbackUrl);
    }
  }, [state, router, callbackUrl]);

  return (
    <div className="min-h-screen">
      <header className="bg-[#0b6aa9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image src="/apexfinancial.png" alt="Apex Financial" width={44} height={44} priority className="rounded" />
            <div className="text-sm font-semibold tracking-tight text-white">Apex Financial</div>
          </div>
          <div className="text-xs font-medium text-white/90">Secure Online Banking</div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-md flex-col justify-center px-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">Two-step verification</h1>
          <p className="mt-2 text-center text-sm text-slate-600">Enter the 6-digit code from your authenticator app.</p>

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Authenticator code</label>
              <input
                name="code"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/30 focus:ring-2"
                required
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="remember" className="text-sm text-slate-700">
                Remember this device
              </label>
            </div>

            {state && !state.ok ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div> : null}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-[#0b6aa9] px-4 py-2 text-sm font-medium text-white hover:bg-[#095f98] disabled:opacity-60"
            >
              {pending ? "Verifying…" : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function MfaPage() {
  return (
    <Suspense>
      <MfaForm />
    </Suspense>
  );
}
