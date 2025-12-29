"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ETransferResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9+]/g, "").trim();
}

function isValidEmail(email: string) {
  return email.includes("@") && email.includes(".");
}

function formatRecipientLabel(email?: string | null, phone?: string | null) {
  if (email) return email;
  if (phone) return phone;
  return "recipient";
}

async function findAutoDepositAccountId(userId: string): Promise<string | null> {
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings?.autoDepositEnabled) return null;

  if (settings.autoDepositAccountId) {
    const ok = await prisma.account.findFirst({ where: { id: settings.autoDepositAccountId, userId } });
    if (ok) return settings.autoDepositAccountId;
  }

  const chequing = await prisma.account.findFirst({ where: { userId, type: "CHEQUING" }, orderBy: { createdAt: "asc" } });
  if (chequing) return chequing.id;

  const any = await prisma.account.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  return any?.id ?? null;
}

export async function sendETransfer(_: ETransferResult | null, formData: FormData): Promise<ETransferResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const fromAccountId = String(formData.get("fromAccountId") ?? "");
  const toEmailRaw = String(formData.get("toEmail") ?? "");
  const toPhoneRaw = String(formData.get("toPhone") ?? "");
  const memo = String(formData.get("memo") ?? "").trim();
  const securityQuestion = String(formData.get("securityQuestion") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const amount = Number(amountRaw);

  const toEmail = toEmailRaw ? normalizeEmail(toEmailRaw) : "";
  const toPhone = toPhoneRaw ? normalizePhone(toPhoneRaw) : "";

  if (!fromAccountId) return { ok: false, message: "Select an account." };
  if (!toEmail && !toPhone) return { ok: false, message: "Enter an email or phone number." };
  if (toEmail && !isValidEmail(toEmail)) return { ok: false, message: "Enter a valid email." };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, message: "Enter a valid amount." };

  const fromAccount = await prisma.account.findFirst({
    where: {
      id: fromAccountId,
      userId,
      type: { in: ["CHEQUING", "SAVINGS"] },
    },
  });

  if (!fromAccount) return { ok: false, message: "Account not found." };
  if (fromAccount.balance < amount) return { ok: false, message: "Insufficient funds." };

  const receiver = await prisma.user.findFirst({
    where: toEmail ? { email: toEmail } : undefined,
  });

  const receiverUserId = receiver?.id ?? null;
  const receiverAutoDepositAccountId = receiverUserId ? await findAutoDepositAccountId(receiverUserId) : null;

  if (!receiverAutoDepositAccountId && !securityQuestion) {
    return { ok: false, message: "Security question is required when autodeposit is not enabled." };
  }

  await prisma.$transaction(async (tx) => {
    const eTransfer = await tx.eTransfer.create({
      data: {
        senderUserId: userId,
        receiverUserId,
        fromAccountId: fromAccount.id,
        toAccountId: receiverAutoDepositAccountId,
        toEmail: toEmail || null,
        toPhone: toPhone || null,
        amount,
        memo: memo || null,
        securityQuestion: receiverAutoDepositAccountId ? null : securityQuestion,
        status: receiverAutoDepositAccountId ? "DEPOSITED" : "PENDING",
        depositedAt: receiverAutoDepositAccountId ? new Date() : null,
        respondedAt: receiverAutoDepositAccountId ? new Date() : null,
      },
    });

    await tx.account.update({
      where: { id: fromAccount.id },
      data: { balance: { decrement: amount } },
    });

    await tx.transaction.create({
      data: {
        accountId: fromAccount.id,
        amount,
        type: "DEBIT",
        description: `Interac e-Transfer to ${formatRecipientLabel(toEmail || null, toPhone || null)}`,
        merchant: "Interac e-Transfer",
        memo: memo || null,
        date: new Date(),
        status: "POSTED",
        eTransferId: eTransfer.id,
      },
    });

    if (receiverAutoDepositAccountId) {
      await tx.account.update({
        where: { id: receiverAutoDepositAccountId },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          accountId: receiverAutoDepositAccountId,
          amount,
          type: "CREDIT",
          description: `Interac e-Transfer from ${userId}`,
          merchant: "Interac e-Transfer",
          memo: memo || null,
          date: new Date(),
          status: "POSTED",
          eTransferId: eTransfer.id,
        },
      });
    }

    const displayName = toEmail || toPhone;
    if (displayName) {
      const or: Array<{ email: string } | { phone: string }> = [];
      if (toEmail) or.push({ email: toEmail });
      if (toPhone) or.push({ phone: toPhone });

      const existing = await tx.contact.findFirst({
        where: {
          userId,
          OR: or,
        },
      });

      if (existing) {
        await tx.contact.update({
          where: { id: existing.id },
          data: { lastUsedAt: new Date() },
        });
      } else {
        await tx.contact.create({
          data: {
            userId,
            displayName,
            email: toEmail || null,
            phone: toPhone || null,
            lastUsedAt: new Date(),
          },
        });
      }
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/etransfer/send");
  revalidatePath("/etransfer/inbox");

  return { ok: true };
}

export async function acceptETransfer(_: ETransferResult | null, formData: FormData): Promise<ETransferResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const eTransferId = String(formData.get("eTransferId") ?? "");
  const depositAccountIdRaw = String(formData.get("depositAccountId") ?? "");

  if (!eTransferId) return { ok: false, message: "Missing transfer." };

  const depositAccountId = depositAccountIdRaw || (await findAutoDepositAccountId(userId)) || "";
  if (!depositAccountId) return { ok: false, message: "Select a deposit account." };

  const transfer = await prisma.eTransfer.findFirst({
    where: {
      id: eTransferId,
      receiverUserId: userId,
      status: "PENDING",
    },
  });

  if (!transfer) return { ok: false, message: "Transfer not found." };

  const depositAccount = await prisma.account.findFirst({ where: { id: depositAccountId, userId } });
  if (!depositAccount) return { ok: false, message: "Deposit account not found." };

  await prisma.$transaction(async (tx) => {
    await tx.eTransfer.update({
      where: { id: transfer.id },
      data: {
        status: "DEPOSITED",
        toAccountId: depositAccount.id,
        respondedAt: new Date(),
        depositedAt: new Date(),
      },
    });

    await tx.account.update({
      where: { id: depositAccount.id },
      data: { balance: { increment: transfer.amount } },
    });

    await tx.transaction.create({
      data: {
        accountId: depositAccount.id,
        amount: transfer.amount,
        type: "CREDIT",
        description: `Interac e-Transfer received`,
        merchant: "Interac e-Transfer",
        memo: transfer.memo,
        date: new Date(),
        status: "POSTED",
        eTransferId: transfer.id,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/etransfer/inbox");

  return { ok: true };
}

export async function declineETransfer(_: ETransferResult | null, formData: FormData): Promise<ETransferResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const eTransferId = String(formData.get("eTransferId") ?? "");
  if (!eTransferId) return { ok: false, message: "Missing transfer." };

  const transfer = await prisma.eTransfer.findFirst({
    where: {
      id: eTransferId,
      receiverUserId: userId,
      status: "PENDING",
    },
  });

  if (!transfer) return { ok: false, message: "Transfer not found." };

  await prisma.$transaction(async (tx) => {
    await tx.eTransfer.update({
      where: { id: transfer.id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });

    await tx.account.update({
      where: { id: transfer.fromAccountId },
      data: { balance: { increment: transfer.amount } },
    });

    await tx.transaction.create({
      data: {
        accountId: transfer.fromAccountId,
        amount: transfer.amount,
        type: "CREDIT",
        description: `Interac e-Transfer declined (refund)`,
        merchant: "Interac e-Transfer",
        memo: transfer.memo,
        date: new Date(),
        status: "POSTED",
        eTransferId: transfer.id,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/etransfer/inbox");

  return { ok: true };
}

export async function saveAutoDepositSettings(_: ETransferResult | null, formData: FormData): Promise<ETransferResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const enabledRaw = String(formData.get("autoDepositEnabled") ?? "");
  const enabled = enabledRaw === "on" || enabledRaw === "true";
  const accountId = String(formData.get("autoDepositAccountId") ?? "").trim();

  let selected: string | null = null;
  if (accountId) {
    const ok = await prisma.account.findFirst({ where: { id: accountId, userId } });
    if (!ok) return { ok: false, message: "Default deposit account not found." };
    selected = accountId;
  }

  await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      autoDepositEnabled: enabled,
      autoDepositAccountId: selected,
    },
    update: {
      autoDepositEnabled: enabled,
      autoDepositAccountId: selected,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/etransfer/send");
  revalidatePath("/etransfer/inbox");

  return { ok: true };
}
