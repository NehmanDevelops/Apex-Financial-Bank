import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillPayForm } from "./BillPayForm";

function labelAccountType(t: string) {
  if (t === "CHEQUING") return "Chequing";
  if (t === "SAVINGS") return "Savings";
  return "Credit Card";
}

export default async function BillPayPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      type: {
        in: ["CHEQUING", "SAVINGS"],
      },
    },
    orderBy: { type: "asc" },
  });

  const payeeCount = await prisma.payee.count({ where: { userId: session.user.id } });
  if (payeeCount === 0) {
    const defaults = [
      { name: "Hydro One", payeeCode: "HYDRO" },
      { name: "Rogers Communications", payeeCode: "ROGERS" },
      { name: "Canada Revenue Agency (CRA)", payeeCode: "CRA" },
      { name: "Enbridge Gas", payeeCode: "ENBRIDGE" },
      { name: "Toronto Water", payeeCode: "WATER" },
    ];

    for (const p of defaults) {
      await prisma.payee.upsert({
        where: {
          userId_name: {
            userId: session.user.id,
            name: p.name,
          },
        },
        create: {
          userId: session.user.id,
          name: p.name,
          payeeCode: p.payeeCode,
        },
        update: {
          payeeCode: p.payeeCode,
        },
      });
    }
  }

  const payees = await prisma.payee.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const upcoming = await prisma.scheduledPayment.findMany({
    where: { userId: session.user.id, status: { in: ["SCHEDULED", "FAILED"] } },
    include: { payee: true, fromAccount: true },
    orderBy: { nextRunAt: "asc" },
    take: 15,
  });

  return (
    <BillPayForm
      accounts={accounts.map((a: (typeof accounts)[number]) => ({
        id: a.id,
        label: labelAccountType(a.type),
        balance: a.balance,
        accountNumber: a.accountNumber,
      }))}
      payees={payees.map((p: (typeof payees)[number]) => ({
        id: p.id,
        name: p.name,
      }))}
      upcoming={upcoming.map((p: (typeof upcoming)[number]) => ({
        id: p.id,
        payeeName: p.payee.name,
        amount: p.amount,
        nextRunAt: p.nextRunAt.toISOString(),
        status: p.status,
        frequency: p.frequency,
        fromAccountNumber: p.fromAccount.accountNumber,
      }))}
    />
  );
}
