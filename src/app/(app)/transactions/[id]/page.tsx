import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionDetailClient } from "./transactionDetailClient";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { id } = await params;

  const tx = await prisma.transaction.findFirst({
    where: { id, account: { userId } },
    include: { account: true, dispute: true },
  });

  if (!tx) redirect("/accounts");

  return (
    <TransactionDetailClient
      tx={{
        id: tx.id,
        description: tx.description,
        merchant: tx.merchant,
        memo: tx.memo,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        date: tx.date.toISOString(),
        accountNumber: tx.account.accountNumber,
      }}
      dispute={
        tx.dispute
          ? {
              id: tx.dispute.id,
              caseNumber: tx.dispute.caseNumber,
              reason: tx.dispute.reason,
              status: tx.dispute.status,
              comments: tx.dispute.comments,
              createdAt: tx.dispute.createdAt.toISOString(),
            }
          : null
      }
      displayAmount={formatMoney(tx.type === "CREDIT" ? tx.amount : -tx.amount)}
    />
  );
}
