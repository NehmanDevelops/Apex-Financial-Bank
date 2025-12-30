"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createAccount } from "@/actions/createAccount";

type CreateAccountResult =
  | { ok: true }
  | {
    ok: false;
    message: string;
  };

const initialState: CreateAccountResult | null = null;

export function LandingClient() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createAccount, initialState);

  const [lang, setLang] = useState<"en" | "fr">("en");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Load saved preferences on mount - default to dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("apex_theme");
      const savedLang = localStorage.getItem("apex_lang") as "en" | "fr" | null;

      // Default to dark mode if no preference saved
      if (savedTheme === "light") {
        setTheme("light");
        document.documentElement.dataset.theme = "light";
      } else {
        // Default to dark
        setTheme("dark");
        document.documentElement.dataset.theme = "dark";
      }
      if (savedLang === "fr" || savedLang === "en") {
        setLang(savedLang);
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("apex_theme", next);
      document.documentElement.dataset.theme = next;
    }
  };

  const [registrationType, setRegistrationType] = useState<"DEBIT" | "CREDIT">("DEBIT");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("demo@apex.ca");
  const [loginPassword, setLoginPassword] = useState("ApexSecure2025!");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const callbackUrl = useMemo(() => "/dashboard", []);

  useEffect(() => {
    async function run() {
      if (!state?.ok) return;

      // Auto sign-in newly created user.
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res || res.error) return;
      router.push(res.url ?? "/dashboard");
    }

    void run();
  }, [state, email, password, callbackUrl, router]);

  const copy = useMemo(() => {
    if (lang === "fr") {
      return {
        secureOnlineBanking: "Services bancaires en ligne sécurisés",
        signIn: "Ouvrir une session",
        chooseLoginId: "Choisissez une carte ou un identifiant",
        password: "Mot de passe",
        signInCta: "Ouvrir une session",
        forgot: "Mot de passe ou identifiant oublié?",
        register: "Enregistrer une nouvelle carte pour les services bancaires en ligne",
        debitCard: "CARTE DE DÉBIT",
        creditCard: "CARTE DE CRÉDIT",
        yourSecurity: "Votre sécurité passe avant tout.",
        securityBody:
          "Nous avons rendu les services bancaires en ligne plus pratiques, tout en utilisant des technologies de sécurité avancées qui protègent votre argent et vos informations.",
        learnMore: "En savoir plus sur la protection de vos renseignements.",
        createAccount: "Créer un compte",
        startBalance: "Les nouveaux utilisateurs commencent avec un solde d’essai de 5 000 $.",
      };
    }

    return {
      secureOnlineBanking: "Secure Online Banking",
      signIn: "Sign in",
      chooseLoginId: "Choose a card or Login ID",
      password: "Password",
      signInCta: "SIGN IN",
      forgot: "Forgot your password or Login ID?",
      register: "Register a new card for online banking",
      debitCard: "DEBIT CARD",
      creditCard: "CREDIT CARD",
      yourSecurity: "Your security always comes first.",
      securityBody:
        "Bank online with confidence — we combine everyday convenience with modern protections designed to keep your account and personal information secure.",
      learnMore: "Learn more about how we protect your account.",
      createAccount: "Create account",
      startBalance: "New users will start with a test balance of $5,000.",
    };
  }, [lang]);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    // Simple demo login - check credentials client-side
    if (loginEmail === "demo@apex.ca" && loginPassword === "ApexSecure2025!") {
      if (typeof window !== "undefined") {
        localStorage.setItem("demo-logged-in", "true");
        localStorage.setItem("demo-user", JSON.stringify({
          id: "demo-user-id",
          email: "demo@apex.ca",
          name: "Demo User"
        }));
      }
      router.push("/dashboard");
    } else {
      setLoginLoading(false);
      setLoginError(lang === "fr" ? "Identifiant ou mot de passe invalide." : "Invalid email or password.");
    }
  }

  async function onDemoLogin() {
    setDemoLoading(true);
    setDemoError(null);

    // Simple demo login with localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("demo-logged-in", "true");
      localStorage.setItem("demo-user", JSON.stringify({
        id: "demo-user-id",
        email: "demo@apex.ca",
        name: "Demo User"
      }));
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300">
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
              onClick={toggleTheme}
              className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = lang === "en" ? "fr" : "en";
                setLang(next);
                localStorage.setItem("apex_lang", next);
              }}
              className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
            >
              {lang === "en" ? "🇫🇷 FR" : "🇬🇧 EN"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <span className="text-[#0b6aa9]">A</span>
              <span>{copy.signIn}</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <form className="space-y-4" onSubmit={onSignIn}>
                <div>
                  <label className="text-sm font-medium text-slate-700">{copy.chooseLoginId}</label>
                  <input
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    type="email"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/20 focus:ring-2"
                    autoComplete="email"
                    required
                  />
                  <div className="mt-2 text-xs text-[#0b6aa9]">{lang === "fr" ? "Oubliez cette carte ou cet identifiant" : "Forget this card or Login ID"}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">{copy.password}</label>
                  <input
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    type="password"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/20 focus:ring-2"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {loginError ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</div> : null}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full rounded-full bg-[#0b6aa9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#095f98] disabled:opacity-60"
                  >
                    {loginLoading ? (lang === "fr" ? "Connexion…" : "Signing in…") : copy.signInCta}
                  </button>
                </div>

                <div className="text-center text-xs text-[#0b6aa9]">{copy.forgot}</div>
              </form>

              <div className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Demo: <span className="font-semibold text-slate-800">demo@apex.ca</span> /{" "}
                <span className="font-semibold text-slate-800">ApexSecure2025!</span>
                {demoError ? <div className="mt-2 text-red-700">{demoError}</div> : null}
                <button
                  type="button"
                  onClick={onDemoLogin}
                  disabled={demoLoading}
                  className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {demoLoading ? (lang === "fr" ? "Connexion…" : "Signing in…") : lang === "fr" ? "Continuer avec la démo" : "Continue with Demo"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{copy.register}</div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRegistrationType("DEBIT")}
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold transition " +
                    (registrationType === "DEBIT"
                      ? "bg-[#0b6aa9] text-white"
                      : "border border-slate-200 bg-white text-[#0b6aa9] hover:bg-slate-50")
                  }
                  aria-pressed={registrationType === "DEBIT"}
                >
                  {copy.debitCard}
                </button>
                <span className="text-xs text-slate-400">{lang === "fr" ? "ou" : "or"}</span>
                <button
                  type="button"
                  onClick={() => setRegistrationType("CREDIT")}
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold transition " +
                    (registrationType === "CREDIT"
                      ? "bg-[#0b6aa9] text-white"
                      : "border border-slate-200 bg-white text-[#0b6aa9] hover:bg-slate-50")
                  }
                  aria-pressed={registrationType === "CREDIT"}
                >
                  {copy.creditCard}
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-600">{copy.startBalance}</div>

              <form action={action} className="mt-4 space-y-3">
                <input type="hidden" name="registrationType" value={registrationType} />
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/20 focus:ring-2"
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/20 focus:ring-2"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <input
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0b6aa9]/20 focus:ring-2"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {state && !state.ok ? (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</div>
                ) : null}

                {state?.ok ? (
                  <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {lang === "fr" ? "Compte créé — connexion en cours…" : "Account created — signing you in…"}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-md bg-[#0b6aa9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#095f98] disabled:opacity-60"
                >
                  {pending ? (lang === "fr" ? "Création…" : "Creating…") : copy.createAccount}
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-[#0b6aa9]">🔒</div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{copy.yourSecurity}</div>
                  <div className="mt-2 text-sm text-slate-600">{copy.securityBody}</div>
                  <div className="mt-3 text-sm font-medium text-[#0b6aa9]">{copy.learnMore}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
