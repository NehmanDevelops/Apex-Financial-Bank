import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TestBoardClient } from "./testBoardClient";

export default async function TestBoardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const allowed = user.email === "demo@apex.ca" || process.env.NEXT_PUBLIC_ENABLE_TEST_BOARD === "true";
  if (!allowed) redirect("/dashboard");

  const counts = {
    contacts: await prisma.contact.count({ where: { userId } }),
    payees: await prisma.payee.count({ where: { userId } }),
    transfersPending: await prisma.eTransfer.count({ where: { receiverUserId: userId, status: "PENDING" } }),
    scheduled: await prisma.scheduledPayment.count({ where: { userId, status: "SCHEDULED" } }),
    disputes: await prisma.dispute.count({ where: { userId } }),
    transactions: await prisma.transaction.count({ where: { account: { userId } } }),
  };

  return <TestBoardClient counts={counts} />;
}
