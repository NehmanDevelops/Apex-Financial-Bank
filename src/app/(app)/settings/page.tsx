import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settingsClient";

function labelAccountType(t: string) {
  if (t === "CHEQUING") return "Chequing";
  if (t === "SAVINGS") return "Savings";
  if (t === "CREDIT_CARD") return "Visa Infinite";
  return t;
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const settings = await prisma.userSettings.findUnique({ where: { userId: session.user.id } });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const devices = await prisma.trustedDevice.findMany({
    where: { userId: session.user.id },
    orderBy: { lastSeenAt: "desc" },
    take: 25,
  });
  const accounts = await prisma.account.findMany({ where: { userId: session.user.id }, orderBy: { type: "asc" } });

  return (
    <SettingsClient
      autoDepositEnabled={settings?.autoDepositEnabled ?? false}
      autoDepositAccountId={settings?.autoDepositAccountId ?? ""}
      accounts={accounts.map((a: (typeof accounts)[number]) => ({
        id: a.id,
        label: labelAccountType(a.type),
        accountNumber: a.accountNumber,
      }))}
      mfaEnabled={user?.mfaEnabled ?? false}
      mfaSecret={user?.mfaSecret ?? null}
      devices={devices.map((d: (typeof devices)[number]) => ({
        id: d.id,
        label: d.label,
        lastSeenAt: d.lastSeenAt ? d.lastSeenAt.toISOString() : null,
      }))}
    />
  );
}
