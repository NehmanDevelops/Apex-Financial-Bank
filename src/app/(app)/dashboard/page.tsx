import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: {
        orderBy: { type: "asc" },
      },
    },
  });

  if (!user) redirect("/login");

  const showTestBoard = user.email === "demo@apex.ca" || process.env.NEXT_PUBLIC_ENABLE_TEST_BOARD === "true";

  const transactions = await prisma.transaction.findMany({
    where: {
      account: {
        userId: user.id,
      },
    },
    orderBy: { date: "desc" },
    take: 50,
    include: {
      account: true,
    },
  });

  return (
    <DashboardClient
      name={user.name}
      showTestBoard={showTestBoard}
      accounts={user.accounts.map((a: (typeof user.accounts)[number]) => ({
        id: a.id,
        type: a.type,
        balance: a.balance,
        accountNumber: a.accountNumber,
      }))}
      transactions={transactions.map((t: (typeof transactions)[number]) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: t.date.toISOString(),
        status: t.status,
        accountType: t.account.type,
      }))}
    />
  );
}
