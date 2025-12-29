"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type CreateAccountResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeAccountNumber() {
  // Human-ish, unique-enough for demo purposes.
  const suffix = Math.random().toString(10).slice(2, 9);
  return `100-${Date.now().toString().slice(-7)}${suffix.slice(0, 0)}`.slice(0, 11);
}

function makeCreditCardNumber() {
  const last4 = Math.floor(1000 + Math.random() * 9000);
  return `VISA-${last4}`;
}

export async function createAccount(_: CreateAccountResult | null, formData: FormData): Promise<CreateAccountResult> {
  const name = String(formData.get("name") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "");
  const passwordRaw = String(formData.get("password") ?? "");
  const registrationType = String(formData.get("registrationType") ?? "DEBIT").toUpperCase();

  const email = normalizeEmail(emailRaw);
  const password = passwordRaw;

  if (!name) return { ok: false, message: "Enter your name." };
  if (!email || !email.includes("@")) return { ok: false, message: "Enter a valid email." };
  if (!password || password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, message: "An account with this email already exists." };

  const starterBalance = 5000;
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: passwordHash,
        name,
      },
    });

    const account = await tx.account.create({
      data: {
        userId: user.id,
        type: "CHEQUING",
        balance: starterBalance,
        accountNumber: makeAccountNumber(),
      },
    });

    if (registrationType === "CREDIT") {
      await tx.account.create({
        data: {
          userId: user.id,
          type: "CREDIT_CARD",
          balance: 0,
          accountNumber: makeCreditCardNumber(),
        },
      });
    }

    await tx.transaction.create({
      data: {
        accountId: account.id,
        amount: starterBalance,
        type: "CREDIT",
        description: "Test Balance (New User)",
        date: new Date(),
        status: "POSTED",
      },
    });
  });

  return { ok: true };
}
