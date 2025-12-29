import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ETransferSendClient } from "./sendClient";

function labelAccountType(t: string) {
  if (t === "CHEQUING") return "Chequing";
  if (t === "SAVINGS") return "Savings";
  return "Credit Card";
}

export default async function ETransferSendPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      type: { in: ["CHEQUING", "SAVINGS"] },
    },
    orderBy: { type: "asc" },
  });

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  return (
    <ETransferSendClient
      accounts={accounts.map((a: (typeof accounts)[number]) => ({
        id: a.id,
        label: labelAccountType(a.type),
        balance: a.balance,
        accountNumber: a.accountNumber,
      }))}
      contacts={contacts.map((c: (typeof contacts)[number]) => ({
        id: c.id,
        displayName: c.displayName,
        email: c.email,
        phone: c.phone,
      }))}
    />
  );
}
