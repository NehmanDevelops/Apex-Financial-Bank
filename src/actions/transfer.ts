"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type TransferResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function processTransfer(_: TransferResult | null, formData: FormData): Promise<TransferResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, message: "Please sign in again." };
  }

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const toEmail = String(formData.get("toEmail") ?? "").trim().toLowerCase();
  const securityQuestion = String(formData.get("securityQuestion") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const amount = Number(amountRaw);

  if (!fromAccountId) return { ok: false, message: "Select an account." };
  if (!toEmail || !toEmail.includes("@")) return { ok: false, message: "Enter a valid email." };
  if (!securityQuestion) return { ok: false, message: "Enter a security question." };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, message: "Enter a valid amount." };

  if (amount > 5000) {
    const account = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: session.user.id,
      },
    });

    if (account) {
      await prisma.flaggedTransfer.create({
        data: {
          userId: session.user.id,
          fromAccountId: account.id,
          toEmail,
          amount,
          securityQuestion,
          status: "PENDING_REVIEW",
        },
      });
    }

    return {
      ok: false,
      message: "Transaction flagged for security review (Code: 99).",
    };
  }

  const account = await prisma.account.findFirst({
    where: {
      id: fromAccountId,
      userId: session.user.id,
    },
  });

  if (!account) return { ok: false, message: "Account not found." };

  if (account.type === "CREDIT_CARD") {
    return { ok: false, message: "Transfers from credit cards are not supported." };
  }

  if (account.balance < amount) {
    return { ok: false, message: "Insufficient funds." };
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
        description: `Interac e-Transfer to ${toEmail}`,
        date: new Date(),
        status: "POSTED",
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/move-money");

  return { ok: true };
}
