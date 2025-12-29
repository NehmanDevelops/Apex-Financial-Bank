import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedInsightsDefaults } from "@/actions/insights";
import { InsightsClient } from "./InsightsClient";

function ym(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function monthStart(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0, 1);
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default async function InsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await seedInsightsDefaults(null);

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStartDate = new Date(year, now.getMonth(), 1);
  const monthEndDate = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id, month, year },
  });

  const debitsThisMonth = await prisma.transaction.findMany({
    where: {
      type: "DEBIT",
      date: { gte: monthStartDate, lte: monthEndDate },
      account: { userId: session.user.id },
    },
    select: { amount: true, categoryId: true },
  });

  const spentByCategory = new Map<string, number>();
  for (const t of debitsThisMonth) {
    if (!t.categoryId) continue;
    spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) + t.amount);
  }

  const sixMonths: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    sixMonths.push({
      key: ym(start),
      label: start.toLocaleDateString("en-CA", { month: "short", year: "2-digit" }),
      start,
      end,
    });
  }

  const debitsSixMonths = await prisma.transaction.findMany({
    where: {
      type: "DEBIT",
      date: { gte: sixMonths[0].start, lte: sixMonths[sixMonths.length - 1].end },
      account: { userId: session.user.id },
    },
    select: { amount: true, categoryId: true, date: true },
  });

  const monthCategorySums = new Map<string, Map<string, number>>();
  for (const m of sixMonths) monthCategorySums.set(m.key, new Map());

  for (const t of debitsSixMonths) {
    if (!t.categoryId) continue;
    const key = ym(new Date(t.date.getFullYear(), t.date.getMonth(), 1));
    const m = monthCategorySums.get(key);
    if (!m) continue;
    m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + t.amount);
  }

  const trend = sixMonths.map((m) => {
    const sums = monthCategorySums.get(m.key) ?? new Map();
    const row: Record<string, number | string> = { month: m.label };
    for (const c of categories) {
      row[c.id] = sums.get(c.id) ?? 0;
    }
    return row;
  });

  const budgetRows = categories.map((c) => {
    const budget = budgets.find((b) => b.categoryId === c.id);
    const spent = spentByCategory.get(c.id) ?? 0;
    return {
      id: c.id,
      name: c.name,
      color: c.color ?? "#64748b",
      budget: budget?.amount ?? 0,
      spent,
      spentText: formatMoney(spent),
    };
  });

  return <InsightsClient categories={budgetRows} trend={trend} month={month} year={year} />;
}
