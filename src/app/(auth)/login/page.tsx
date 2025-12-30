"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = useMemo(() => searchParams.get("callbackUrl") ?? "/dashboard", [searchParams]);

  const [email, setEmail] = useState("demo@apex.ca");
  const [password, setPassword] = useState("password123");
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useMemo(() => {
    if (lang === "fr") {
      return {
        secureOnlineBanking: "Services bancaires en ligne sécurisés",
        signIn: "Ouvrir une session",
        email: "Courriel",
        password: "Mot de passe",
        signInCta: "Ouvrir une session",
      };
    }

    return {
      secureOnlineBanking: "Secure Online Banking",
      signIn: "Sign in",
      email: "Email",
      password: "Password",
      signInCta: "SIGN IN",
    };
  }, [lang]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (typeof document !== "undefined") {
      const has = document.cookie.split(";").some((p) => p.trim().startsWith("apex_device="));
      if (!has) {
        const id = crypto.randomUUID();
        document.cookie = `apex_device=${id}; Path=/; SameSite=Lax`;
      }
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(res.url ?? "/dashboard");
  }

  return (
    <div className="min-h-screen">
      <header className="bg-[#0b6aa9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image src="/apexfinancial.png" alt="Apex Financial" width={44} height={44} priority className="rounded" />
            <div className="text-sm font-semibold tracking-tight text-white">Apex Financial</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-white/90">{copy.secureOnlineBanking}</div>
            <button
              type="button"
              onClick={() => setLang((v) => (v === "en" ? "fr" : "en"))}
              className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15"
            >
              {lang === "en" ? "FR" : "EN"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-md flex-col justify-center px-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            <Image src="/apexfinancial.png" alt="Apex Financial" width={96} height={96} priority className="rounded" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight text-slate-900">{copy.signIn}</h1>
          <p className="mt-2 text-center text-sm text-slate-600">Use the demo credentials to access your dashboard.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700">{copy.email}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/30 focus:ring-2"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">{copy.password}</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/30 focus:ring-2"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0b6aa9] px-4 py-2 text-sm font-medium text-white hover:bg-[#095f98] disabled:opacity-60"
            >
              {loading ? (lang === "fr" ? "Connexion…" : "Signing in…") : copy.signInCta}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Demo: <span className="font-medium text-slate-700">demo@apex.ca</span> /{" "}
            <span className="font-medium text-slate-700">password123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
