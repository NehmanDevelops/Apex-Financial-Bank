# Apex Financial (Banking Demo)

Full‑stack banking demo app built to showcase product flows recruiters/interviewers can click through quickly.

## Highlights

- **Core banking**: accounts, transactions, transfers
- **Interac e‑Transfer**: send / inbox, accept/decline, auto‑deposit settings
- **Bill Pay**: payees, scheduled payments, “run due payments”
- **Spending Insights**: categories, budgets, 6‑month trend
- **Disputes**: open a dispute case against a transaction
- **Security**: MFA (TOTP), trusted devices, inactivity auto‑logout
- **Recruiter Test Board**: one page to seed data + trigger flows

## Tech Stack

- Next.js (App Router)
- NextAuth (Credentials)
- Prisma + SQLite
- Tailwind CSS

## Quick Start (Local)

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

App: http://localhost:3000

## Demo Login

- Email: `demo@apex.ca`
- Password: (see `prisma/seed.ts`)

## Recruiter / Interviewer Test Board

The Test Board is available at:

- `/test-board`

It is **gated** to avoid appearing for normal users. It shows up if:

- You are logged in as `demo@apex.ca`, or
- `NEXT_PUBLIC_ENABLE_TEST_BOARD=true`

Once you can access it, you can:

- Seed demo data (contacts, payees, categories, transactions)
- Generate an incoming e‑Transfer
- Create a scheduled bill payment
- Create a dispute case

## Environment Variables

Create a `.env` file (SQLite is used by default). Common vars:

- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=...`
- `NEXT_PUBLIC_ENABLE_TEST_BOARD=true` (optional)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:push` — push schema to local DB
- `npm run prisma:seed` — seed demo data
