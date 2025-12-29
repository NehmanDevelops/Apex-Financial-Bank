import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ETransferInboxClient } from "./inboxClient";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

function labelAccountType(t: string) {
  if (t === "CHEQUING") return "Chequing";
  if (t === "SAVINGS") return "Savings";
  if (t === "CREDIT_CARD") return "Visa Infinite";
  return t;
}

export default async function ETransferInboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    orderBy: { type: "asc" },
  });

  const settings = await prisma.userSettings.findUnique({ where: { userId: session.user.id } });

  const incoming = await prisma.eTransfer.findMany({
    where: { receiverUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: {
      senderUser: { select: { name: true, email: true } },
    },
  });

  const sent = await prisma.eTransfer.findMany({
    where: { senderUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <ETransferInboxClient
      autoDepositEnabled={settings?.autoDepositEnabled ?? false}
      defaultDepositAccountId={settings?.autoDepositAccountId ?? null}
      accounts={accounts.map((a: (typeof accounts)[number]) => ({
        id: a.id,
        label: labelAccountType(a.type),
        balance: a.balance,
        accountNumber: a.accountNumber,
      }))}
      incoming={incoming.map((t: (typeof incoming)[number]) => ({
        id: t.id,
        status: t.status,
        amount: t.amount,
        amountText: formatMoney(t.amount),
        fromAccountId: t.fromAccountId,
        toEmail: t.toEmail,
        toPhone: t.toPhone,
        memo: t.memo,
        createdAt: t.createdAt.toISOString(),
        fromName: t.senderUser?.name ?? null,
        fromEmail: t.senderUser?.email ?? null,
      }))}
      sent={sent.map((t: (typeof sent)[number]) => ({
        id: t.id,
        status: t.status,
        amountText: formatMoney(t.amount),
        toEmail: t.toEmail,
        toPhone: t.toPhone,
        memo: t.memo,
        createdAt: t.createdAt.toISOString(),
      }))}
    />
  );
}
