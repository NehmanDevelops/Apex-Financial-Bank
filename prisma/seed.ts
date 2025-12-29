import { PrismaClient, TransactionStatus, TransactionType, AccountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const email = "demo@apex.ca";
  const plainPassword = "password123";

  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany({ where: { email } });

  const password = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name: "Jordan Chen",
      accounts: {
        create: [
          {
            type: AccountType.CHEQUING,
            balance: 4520.5,
            accountNumber: "000-1234567",
          },
          {
            type: AccountType.SAVINGS,
            balance: 12400.0,
            accountNumber: "001-7654321",
          },
          {
            type: AccountType.CREDIT_CARD,
            balance: -450.23,
            accountNumber: "VISA-4381",
          },
        ],
      },
    },
    include: { accounts: true },
  });

  const chequing = user.accounts.find((a) => a.type === AccountType.CHEQUING);
  const savings = user.accounts.find((a) => a.type === AccountType.SAVINGS);
  const credit = user.accounts.find((a) => a.type === AccountType.CREDIT_CARD);

  if (!chequing || !savings || !credit) {
    throw new Error("Seed failed: expected demo accounts were not created.");
  }

  await prisma.transaction.createMany({
    data: [
      {
        accountId: chequing.id,
        amount: 2860.0,
        type: TransactionType.CREDIT,
        description: "Payroll Deposit",
        date: daysAgo(2),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: chequing.id,
        amount: 8.45,
        type: TransactionType.DEBIT,
        description: "Starbucks",
        date: daysAgo(3),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: chequing.id,
        amount: 24.18,
        type: TransactionType.DEBIT,
        description: "Uber",
        date: daysAgo(4),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: chequing.id,
        amount: 112.66,
        type: TransactionType.DEBIT,
        description: "Hydro Bill",
        date: daysAgo(5),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: chequing.id,
        amount: 75.0,
        type: TransactionType.DEBIT,
        description: "Interac e-Transfer",
        date: daysAgo(1),
        status: TransactionStatus.PENDING,
      },
      {
        accountId: savings.id,
        amount: 500.0,
        type: TransactionType.CREDIT,
        description: "Monthly Savings Transfer",
        date: daysAgo(6),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: savings.id,
        amount: 250.0,
        type: TransactionType.DEBIT,
        description: "RRSP Contribution",
        date: daysAgo(12),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: credit.id,
        amount: 61.92,
        type: TransactionType.DEBIT,
        description: "Amazon Marketplace",
        date: daysAgo(2),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: credit.id,
        amount: 18.37,
        type: TransactionType.DEBIT,
        description: "Tim Hortons",
        date: daysAgo(7),
        status: TransactionStatus.POSTED,
      },
      {
        accountId: credit.id,
        amount: 120.0,
        type: TransactionType.CREDIT,
        description: "Credit Card Payment",
        date: daysAgo(9),
        status: TransactionStatus.POSTED,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
