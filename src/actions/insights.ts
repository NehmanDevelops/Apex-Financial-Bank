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

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function matchRule(text: string, pattern: string, isRegex: boolean) {
  if (!pattern) return false;
  if (!isRegex) return text.includes(pattern.toLowerCase());
  try {
    const re = new RegExp(pattern, "i");
    return re.test(text);
  } catch {
    return false;
  }
}

export async function runCategorization(_: Result | null): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const rules = await prisma.categorizationRule.findMany({
    where: { userId },
    include: { category: true },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  if (!rules.length) return { ok: true };

  const uncategorized = await prisma.transaction.findMany({
    where: {
      account: { userId },
      type: "DEBIT",
      categoryId: null,
    },
    orderBy: { date: "desc" },
    take: 250,
    select: {
      id: true,
      description: true,
      merchant: true,
      memo: true,
    },
  });

  for (const t of uncategorized) {
    const text = `${t.description} ${t.merchant ?? ""} ${t.memo ?? ""}`.toLowerCase();
    let matched:
      | {
          categoryId: string;
        }
      | undefined;
    for (const r of rules) {
      if (matchRule(text, r.pattern, r.isRegex)) {
        matched = { categoryId: r.categoryId };
        break;
      }
    }

    const rule = matched;
    if (!rule) continue;

    await prisma.transaction.update({
      where: { id: t.id },
      data: { categoryId: rule.categoryId },
    });
  }

  revalidatePath("/insights");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function setMonthlyBudget(_: Result | null, formData: FormData): Promise<Result> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Please sign in again." };

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const month = Number(String(formData.get("month") ?? ""));
  const year = Number(String(formData.get("year") ?? ""));
  const amount = Number(String(formData.get("amount") ?? ""));

  if (!categoryId) return { ok: false, message: "Missing category." };
  if (!Number.isFinite(month) || month < 1 || month > 12) return { ok: false, message: "Invalid month." };
  if (!Number.isFinite(year) || year < 2000 || year > 3000) return { ok: false, message: "Invalid year." };
  if (!Number.isFinite(amount) || amount < 0) return { ok: false, message: "Enter a valid amount." };

  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) return { ok: false, message: "Category not found." };

  await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId,
        month,
        year,
      },
    },
    create: {
      userId,
      categoryId,
      month,
      year,
      amount,
    },
    update: {
      amount,
    },
  });

  revalidatePath("/insights");

  return { ok: true };
}

export async function seedInsightsDefaults(_: { ok: true } | null): Promise<{ ok: true }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { ok: true };

  const catCount = await prisma.category.count({ where: { userId } });
  if (catCount === 0) {
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

  const ruleCount = await prisma.categorizationRule.count({ where: { userId } });
  if (ruleCount === 0) {
    const categories = await prisma.category.findMany({ where: { userId } });
    const byName = new Map(categories.map((c) => [c.name, c.id] as const));

    const rules = [
      { category: "Housing", pattern: "rent", isRegex: false, priority: 10 },
      { category: "Housing", pattern: "mortgage", isRegex: false, priority: 10 },
      { category: "Bills", pattern: "hydro", isRegex: false, priority: 10 },
      { category: "Bills", pattern: "enbridge", isRegex: false, priority: 10 },
      { category: "Bills", pattern: "rogers", isRegex: false, priority: 10 },
      { category: "Bills", pattern: "cra", isRegex: false, priority: 10 },
      { category: "Food", pattern: "starbucks", isRegex: false, priority: 20 },
      { category: "Food", pattern: "tim hortons", isRegex: false, priority: 20 },
      { category: "Food", pattern: "grocery", isRegex: false, priority: 20 },
      { category: "Transport", pattern: "uber", isRegex: false, priority: 30 },
      { category: "Shopping", pattern: "amazon", isRegex: false, priority: 40 },
    ];

    for (const r of rules) {
      const categoryId = byName.get(r.category);
      if (!categoryId) continue;
      await prisma.categorizationRule.create({
        data: {
          userId,
          categoryId,
          pattern: r.pattern,
          isRegex: r.isRegex,
          priority: r.priority,
        },
      });
    }
  }

  return { ok: true };
}

export async function getMonthWindow(month: number, year: number) {
  const base = new Date(year, month - 1, 1);
  return { start: startOfMonth(base), end: endOfMonth(base) };
}
