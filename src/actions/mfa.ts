"use server";

import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBase32Secret, verifyTotp } from "@/lib/totp";

type Result =
  | { ok: true; secret?: string }
  | {
      ok: false;
      message: string;
    };

async function ensureDeviceId() {
  const jar = await cookies();
  const existing = jar.get("apex_device")?.value;
  return existing ?? null;
}

export async function startMfaSetup(_: Result | null): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const secret = generateBase32Secret();

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: secret,
      mfaEnabled: false,
    },
  });

  revalidatePath("/settings");

  return { ok: true, secret };
}

export async function confirmMfaSetup(_: Result | null, formData: FormData): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const code = String(formData.get("code") ?? "").trim();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.mfaSecret) return { ok: false, message: "Start setup first." };

  const ok = verifyTotp(user.mfaSecret, code);
  if (!ok) return { ok: false, message: "Invalid code." };

  await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });

  const deviceId = await ensureDeviceId();
  if (deviceId) {
    const ua = (await headers()).get("user-agent") ?? "";
    await prisma.trustedDevice.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: { userId, deviceId, label: ua.slice(0, 80) || "This device", lastSeenAt: new Date() },
      update: { lastSeenAt: new Date() },
    });
  }

  revalidatePath("/settings");

  return { ok: true };
}

export async function disableMfa(_: Result | null): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: false, mfaSecret: null } });
  await prisma.trustedDevice.deleteMany({ where: { userId } });

  revalidatePath("/settings");

  return { ok: true };
}

export async function verifyMfa(_: Result | null, formData: FormData): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const code = String(formData.get("code") ?? "").trim();
  const remember = String(formData.get("remember") ?? "");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.mfaEnabled || !user.mfaSecret) return { ok: true };

  const ok = verifyTotp(user.mfaSecret, code);
  if (!ok) return { ok: false, message: "Invalid code." };

  const deviceId = await ensureDeviceId();
  if (remember === "on" && deviceId) {
    const ua = (await headers()).get("user-agent") ?? "";
    await prisma.trustedDevice.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      create: { userId, deviceId, label: ua.slice(0, 80) || "This device", lastSeenAt: new Date() },
      update: { lastSeenAt: new Date() },
    });
  }

  revalidatePath("/dashboard");

  return { ok: true };
}

export async function removeTrustedDevice(_: Result | null, formData: FormData): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Missing device." };

  await prisma.trustedDevice.deleteMany({ where: { id, userId } });
  revalidatePath("/settings");

  return { ok: true };
}
