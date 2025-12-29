"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Result =
  | { ok: true; caseNumber: string }
  | {
      ok: false;
      message: string;
    };

function makeCaseNumber() {
  const rand = Math.random().toString(10).slice(2, 8);
  const y = new Date().getFullYear().toString().slice(-2);
  return `AFX-${y}-${rand}`;
}

export async function openDispute(_: Result | null, formData: FormData): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const comments = String(formData.get("comments") ?? "").trim();

  if (!transactionId) return { ok: false, message: "Missing transaction." };
  if (!reason) return { ok: false, message: "Select a reason." };

  const tx = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      account: { userId },
    },
  });

  if (!tx) return { ok: false, message: "Transaction not found." };

  const existing = await prisma.dispute.findUnique({ where: { transactionId } });
  if (existing) return { ok: false, message: `A dispute already exists (Case ${existing.caseNumber}).` };

  const caseNumber = makeCaseNumber();

  const dispute = await prisma.dispute.create({
    data: {
      userId,
      transactionId,
      caseNumber,
      reason: reason as any,
      comments: comments || null,
      status: "SUBMITTED",
    },
  });

  revalidatePath(`/transactions/${transactionId}`);
  revalidatePath("/accounts");

  return { ok: true, caseNumber: dispute.caseNumber };
}
