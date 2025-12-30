"use client";

interface CreditCardProps {
    type: "CHEQUING" | "SAVINGS" | "CREDIT_CARD";
    accountNumber: string;
    balance: number;
    name?: string;
}

function formatMoney(n: number) {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 2,
    }).format(Math.abs(n));
}

export function CreditCard({ type, accountNumber, balance, name = "DEMO USER" }: CreditCardProps) {
    const gradients: Record<string, string> = {
        CHEQUING: "from-slate-800 via-slate-700 to-slate-900",
        SAVINGS: "from-emerald-600 via-emerald-500 to-emerald-700",
        CREDIT_CARD: "from-[#0b6aa9] via-[#0d7dc4] to-[#064e7a]",
    };

    const labels: Record<string, string> = {
        CHEQUING: "Chequing Account",
        SAVINGS: "Savings Account",
        CREDIT_CARD: "Visa Infinite",
    };

    const isCredit = type === "CREDIT_CARD";
    const displayBalance = isCredit && balance < 0 ? Math.abs(balance) : balance;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[type]} p-6 text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
            {/* Card chip pattern */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5"></div>
            <div className="absolute -right-4 top-16 h-24 w-24 rounded-full bg-white/5"></div>

            <div className="relative">
                {/* Card type label */}
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white/80">{labels[type]}</div>
                    {isCredit && (
                        <svg viewBox="0 0 48 16" className="h-4 w-12">
                            <circle cx="8" cy="8" r="8" fill="#eb001b" opacity="0.9" />
                            <circle cx="20" cy="8" r="8" fill="#f79e1b" opacity="0.9" />
                        </svg>
                    )}
                </div>

                {/* Card chip */}
                <div className="mt-4 h-8 w-10 rounded bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm">
                    <div className="grid h-full w-full grid-cols-3 gap-px p-1">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-sm bg-amber-400/50"></div>
                        ))}
                    </div>
                </div>

                {/* Account number */}
                <div className="mt-4 font-mono text-lg tracking-wider">
                    •••• •••• •••• {accountNumber.slice(-4)}
                </div>

                {/* Balance and name */}
                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <div className="text-xs text-white/60">
                            {isCredit ? "Current Balance" : "Available Balance"}
                        </div>
                        <div className="text-2xl font-bold">
                            {isCredit && balance < 0 && "-"}
                            {formatMoney(displayBalance)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-white/60">Card Holder</div>
                        <div className="text-sm font-semibold tracking-wide">{name}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
