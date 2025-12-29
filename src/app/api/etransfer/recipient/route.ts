import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9+]/g, "").trim();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const emailRaw = url.searchParams.get("email") ?? "";
  const phoneRaw = url.searchParams.get("phone") ?? "";

  const email = emailRaw ? normalizeEmail(emailRaw) : "";
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";

  if (!email && !phone) {
    return NextResponse.json({ ok: true, found: false, autoDepositEnabled: false });
  }

  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  if (!user) {
    return NextResponse.json({ ok: true, found: false, autoDepositEnabled: false });
  }

  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });

  return NextResponse.json({ ok: true, found: true, autoDepositEnabled: settings?.autoDepositEnabled ?? false });
}
