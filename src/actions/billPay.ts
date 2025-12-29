"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BillPayResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

type PayeeResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

type ScheduleResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

function normalizePayeeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(d: Date, months: number) {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}

function computeNextRunAt(prev: Date, frequency: string) {
  if (frequency === "WEEKLY") return addDays(prev, 7);
  if (frequency === "BIWEEKLY") return addDays(prev, 14);
  if (frequency === "MONTHLY") return addMonths(prev, 1);
  return prev;
}

function parseDateInput(dateRaw: string) {
  // Expect yyyy-mm-dd from <input type="date" />
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(dateRaw);
  if (!m) return null;
  const d = new Date(dateRaw + "T12:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function processBillPay(_: BillPayResult | null, formData: FormData): Promise<BillPayResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, message: "Please sign in again." };
  }

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const payeeId = String(formData.get("payeeId") ?? "").trim();
  const payeeRaw = String(formData.get("payee") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const amount = Number(amountRaw);

  if (!fromAccountId) return { ok: false, message: "Select an account." };
  if (!payeeId && !payeeRaw) return { ok: false, message: "Select a payee." };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, message: "Enter a valid amount." };

  let payeeName = payeeRaw;
  if (payeeId) {
    const payee = await prisma.payee.findFirst({ where: { id: payeeId, userId } });
    if (!payee) return { ok: false, message: "Payee not found." };
    payeeName = payee.name;
  }

  const account = await prisma.account.findFirst({
    where: {
      id: fromAccountId,
      userId,
    },
  });

  if (!account) return { ok: false, message: "Account not found." };

  if (account.type === "CREDIT_CARD") {
    return { ok: false, message: "Bill payments from credit cards are not supported." };
  }

  if (account.balance < amount) {
    return { ok: false, message: "Insufficient funds." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: account.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    await tx.transaction.create({
      data: {
        accountId: account.id,
        amount,
        type: "DEBIT",
        description: reference ? `Bill Payment: ${payeeName} (${reference})` : `Bill Payment: ${payeeName}`,
        merchant: payeeName,
        memo: reference || null,
        date: new Date(),
        status: "POSTED",
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/bill-pay");

  return { ok: true };
}

export async function addPayee(_: PayeeResult | null, formData: FormData): Promise<PayeeResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const nameRaw = String(formData.get("name") ?? "");
  const payeeCode = String(formData.get("payeeCode") ?? "").trim();
  const name = normalizePayeeName(nameRaw);

  if (!name) return { ok: false, message: "Enter a payee name." };

  const existing = await prisma.payee.findFirst({ where: { userId, name } });
  if (existing) return { ok: false, message: "This payee already exists." };

  await prisma.payee.create({
    data: {
      userId,
      name,
      payeeCode: payeeCode || null,
    },
  });

  revalidatePath("/bill-pay");

  return { ok: true };
}

export async function scheduleBillPayment(_: ScheduleResult | null, formData: FormData): Promise<ScheduleResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const payeeId = String(formData.get("payeeId") ?? "");
  const reference = String(formData.get("reference") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "ONE_TIME").toUpperCase();
  const startDateRaw = String(formData.get("startDate") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const amount = Number(amountRaw);

  if (!fromAccountId) return { ok: false, message: "Select an account." };
  if (!payeeId) return { ok: false, message: "Select a payee." };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, message: "Enter a valid amount." };

  const startDate = parseDateInput(startDateRaw);
  if (!startDate) return { ok: false, message: "Select a valid payment date." };

  const account = await prisma.account.findFirst({ where: { id: fromAccountId, userId } });
  if (!account) return { ok: false, message: "Account not found." };
  if (account.type === "CREDIT_CARD") return { ok: false, message: "Bill payments from credit cards are not supported." };

  const payee = await prisma.payee.findFirst({ where: { id: payeeId, userId } });
  if (!payee) return { ok: false, message: "Payee not found." };

  const allowed = new Set(["ONE_TIME", "WEEKLY", "BIWEEKLY", "MONTHLY"]);
  if (!allowed.has(frequency)) return { ok: false, message: "Invalid frequency." };

  await prisma.scheduledPayment.create({
    data: {
      userId,
      fromAccountId: account.id,
      payeeId: payee.id,
      amount,
      reference: reference || null,
      frequency: frequency as any,
      startDate,
      nextRunAt: startDate,
      status: "SCHEDULED",
    },
  });

  revalidatePath("/bill-pay");

  return { ok: true };
}

export async function runScheduledPayments(_: { ok: true } | null): Promise<{ ok: true }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: true };

  const now = new Date();

  const due = await prisma.scheduledPayment.findMany({
    where: {
      userId,
      status: "SCHEDULED",
      nextRunAt: { lte: now },
    },
    include: {
      payee: true,
      fromAccount: true,
    },
    orderBy: { nextRunAt: "asc" },
    take: 25,
  });

  for (const p of due) {
    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({ where: { id: p.fromAccountId, userId } });
      if (!account) {
        await tx.scheduledPayment.update({ where: { id: p.id }, data: { status: "FAILED" } });
        return;
      }

      if (account.balance < p.amount) {
        await tx.scheduledPayment.update({ where: { id: p.id }, data: { status: "FAILED" } });
        return;
      }

      await tx.account.update({
        where: { id: account.id },
        data: { balance: { decrement: p.amount } },
      });

      await tx.transaction.create({
        data: {
          accountId: account.id,
          amount: p.amount,
          type: "DEBIT",
          description: p.reference ? `Scheduled Bill Payment: ${p.payee.name} (${p.reference})` : `Scheduled Bill Payment: ${p.payee.name}`,
          merchant: p.payee.name,
          memo: p.reference,
          date: now,
          status: "POSTED",
        },
      });

      if (p.frequency === "ONE_TIME") {
        await tx.scheduledPayment.update({
          where: { id: p.id },
          data: { status: "COMPLETED", lastRunAt: now },
        });
      } else {
        await tx.scheduledPayment.update({
          where: { id: p.id },
          data: {
            lastRunAt: now,
            nextRunAt: computeNextRunAt(p.nextRunAt, p.frequency),
          },
        });
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/bill-pay");

  return { ok: true };
}
