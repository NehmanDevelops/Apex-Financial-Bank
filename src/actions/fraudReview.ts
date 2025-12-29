"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type ReviewResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

async function approveImpl(id: string): Promise<ReviewResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, message: "Please sign in again." };

  const flagged = await prisma.flaggedTransfer.findFirst({
    where: { id, status: "PENDING_REVIEW" },
    include: { fromAccount: true },
  });

  if (!flagged) return { ok: false, message: "Transfer not found or already reviewed." };

  if (flagged.fromAccount.balance < flagged.amount) {
    await prisma.flaggedTransfer.update({
      where: { id: flagged.id },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });

    revalidatePath("/admin/fraud");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");

    return { ok: false, message: "Rejected: insufficient funds." };
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.account.update({
      where: { id: flagged.fromAccountId },
      data: { balance: { decrement: flagged.amount } },
    });

    await tx.transaction.create({
      data: {
        accountId: flagged.fromAccountId,
        amount: flagged.amount,
        type: "DEBIT",
        description: `Interac e-Transfer to ${flagged.toEmail}`,
        date: new Date(),
        status: "POSTED",
      },
    });

    await tx.flaggedTransfer.update({
      where: { id: flagged.id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });
  });

  revalidatePath("/admin/fraud");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return { ok: true };
}

async function rejectImpl(id: string): Promise<ReviewResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, message: "Please sign in again." };

  const flagged = await prisma.flaggedTransfer.findFirst({
    where: { id, status: "PENDING_REVIEW" },
  });

  if (!flagged) return { ok: false, message: "Transfer not found or already reviewed." };

  await prisma.flaggedTransfer.update({
    where: { id: flagged.id },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  revalidatePath("/admin/fraud");

  return { ok: true };
}

export async function approveFlaggedTransferAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await approveImpl(id);
}

export async function rejectFlaggedTransferAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await rejectImpl(id);
}

export async function approveFlaggedTransfer(_: ReviewResult | null, formData: FormData): Promise<ReviewResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing transfer id." };
  return approveImpl(id);
}

export async function rejectFlaggedTransfer(_: ReviewResult | null, formData: FormData): Promise<ReviewResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing transfer id." };
  return rejectImpl(id);
}
