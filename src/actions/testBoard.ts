"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Result =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function randomAmount(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

async function getDefaultAccountId(userId: string) {
  const chequing = await prisma.account.findFirst({
    where: { userId, type: "CHEQUING" },
    orderBy: { createdAt: "asc" },
  });
  if (chequing) return chequing.id;
  const any = await prisma.account.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  return any?.id ?? null;
}

export async function seedTestBoard(_: Result | null): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, message: "User not found." };

  const accountId = await getDefaultAccountId(userId);
  if (!accountId) return { ok: false, message: "No account found." };

  const contactCount = await prisma.contact.count({ where: { userId } });
  if (contactCount === 0) {
    await prisma.contact.createMany({
      data: [
        { userId, displayName: "Alex Nguyen", email: "alex.nguyen@example.com" },
        { userId, displayName: "Sam Patel", email: "sam.patel@example.com" },
        { userId, displayName: "Taylor Chen", phone: "+14165550123" },
      ],
    });
  }

  const payeeCount = await prisma.payee.count({ where: { userId } });
  if (payeeCount === 0) {
    const defaults = [
      { name: "Hydro One", payeeCode: "HYDRO" },
      { name: "Rogers Communications", payeeCode: "ROGERS" },
      { name: "Canada Revenue Agency (CRA)", payeeCode: "CRA" },
    ];

    for (const p of defaults) {
      await prisma.payee.upsert({
        where: { userId_name: { userId, name: p.name } },
        create: { userId, name: p.name, payeeCode: p.payeeCode },
        update: { payeeCode: p.payeeCode },
      });
    }
  }

  const categoryCount = await prisma.category.count({ where: { userId } });
  if (categoryCount === 0) {
    const defaults = [
      { name: "Housing", color: "#0ea5e9" },
      { name: "Food", color: "#f97316" },
      { name: "Transport", color: "#22c55e" },
      { name: "Shopping", color: "#6366f1" },
      { name: "Bills", color: "#ef4444" },
      { name: "Other", color: "#64748b" },
    ];

    for (const c of defaults) {
      await prisma.category.upsert({
        where: { userId_name: { userId, name: c.name } },
        create: { userId, name: c.name, color: c.color },
        update: { color: c.color },
      });
    }
  }

  const txCount = await prisma.transaction.count({ where: { account: { userId } } });
  if (txCount < 30) {
    // Add some spread-out debit transactions so Insights has a 6-month chart to show.
    const now = new Date();
    const categories: Array<{ id: string; name: string }> = await prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true },
    });
    const byName = new Map<string, string>(categories.map((c) => [c.name, c.id]));

    const seeds: Array<{ desc: string; cat: string; min: number; max: number }> = [
      { desc: "Grocery", cat: "Food", min: 24, max: 140 },
      { desc: "Tim Hortons", cat: "Food", min: 3, max: 18 },
      { desc: "Uber", cat: "Transport", min: 10, max: 45 },
      { desc: "Amazon Marketplace", cat: "Shopping", min: 25, max: 180 },
      { desc: "Hydro Bill", cat: "Bills", min: 60, max: 160 },
    ];

    for (let m = 0; m < 6; m++) {
      const monthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - m, 1));
      for (let i = 0; i < 5; i++) {
        const s = seeds[(m + i) % seeds.length];
        const day = 2 + ((m * 5 + i) % 25);
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
        await prisma.transaction.create({
          data: {
            accountId,
            amount: randomAmount(s.min, s.max),
            type: "DEBIT",
            description: s.desc,
            merchant: s.desc,
            date,
            status: "POSTED",
            categoryId: byName.get(s.cat) ?? null,
          },
        });
      }
    }

    // Add one credit so balance doesn't only go down.
    await prisma.transaction.create({
      data: {
        accountId,
        amount: 1200,
        type: "CREDIT",
        description: "Test Board Deposit",
        merchant: "Apex Financial",
        date: daysAgo(1),
        status: "POSTED",
      },
    });

    await prisma.account.update({ where: { id: accountId }, data: { balance: { increment: 1200 } } });
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/etransfer/send");
  revalidatePath("/etransfer/inbox");
  revalidatePath("/bill-pay");
  revalidatePath("/insights");
  revalidatePath("/disputes");
  revalidatePath("/test-board");

  return { ok: true };
}

export async function createIncomingETransferDemo(_: Result | null): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, message: "User not found." };

  const fromAccountId = await getDefaultAccountId(userId);
  if (!fromAccountId) return { ok: false, message: "No account found." };

  await prisma.eTransfer.create({
    data: {
      senderUserId: userId,
      receiverUserId: userId,
      fromAccountId,
      toEmail: user.email,
      amount: 55,
      memo: "Demo incoming transfer",
      securityQuestion: "Favourite colour?",
      status: "PENDING",
      expiresAt: daysAgo(-5),
    },
  });

  revalidatePath("/etransfer/inbox");
  revalidatePath("/test-board");

  return { ok: true };
}

export async function createScheduledBillPayDemo(_: Result | null): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const fromAccountId = await getDefaultAccountId(userId);
  if (!fromAccountId) return { ok: false, message: "No account found." };

  const payee = await prisma.payee.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  if (!payee) return { ok: false, message: "No payee found. Run seed first." };

  const exists = await prisma.scheduledPayment.findFirst({
    where: {
      userId,
      status: "SCHEDULED",
      payeeId: payee.id,
    },
  });

  if (!exists) {
    await prisma.scheduledPayment.create({
      data: {
        userId,
        fromAccountId,
        payeeId: payee.id,
        amount: 89.99,
        frequency: "ONE_TIME",
        startDate: new Date(),
        nextRunAt: new Date(),
        status: "SCHEDULED",
      },
    });
  }

  revalidatePath("/bill-pay");
  revalidatePath("/test-board");

  return { ok: true };
}

export async function createDisputeDemo(_: Result | null): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const tx = await prisma.transaction.findFirst({
    where: { account: { userId }, type: "DEBIT" },
    orderBy: { date: "desc" },
  });
  if (!tx) return { ok: false, message: "No debit transactions found. Run seed first." };

  const existing = await prisma.dispute.findUnique({ where: { transactionId: tx.id } });
  if (existing) return { ok: true };

  const caseNumber = `AFX-${new Date().getFullYear().toString().slice(-2)}-${Math.random().toString(10).slice(2, 8)}`;

  await prisma.dispute.create({
    data: {
      userId,
      transactionId: tx.id,
      caseNumber,
      reason: "FRAUD",
      comments: "Created via Test Board",
      status: "SUBMITTED",
    },
  });

  revalidatePath(`/transactions/${tx.id}`);
  revalidatePath("/disputes");
  revalidatePath("/test-board");

  return { ok: true };
}
