# 🏦 Apex Financial - Demo Banking Application

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

A modern, fully-featured banking demo application built to showcase frontend development skills. Features realistic banking workflows, beautiful UI/UX, and complete interactivity.

![Dashboard Preview](https://via.placeholder.com/800x400/0b6aa9/ffffff?text=Apex+Financial+Dashboard)

## ✨ Features

### 💳 Dashboard & Account Management
- **Visual Credit Card UI** - Realistic card designs with gradients, chips, and Mastercard branding
- **Real-time Balance Display** - Toggle privacy mode to hide sensitive information
- **Multi-account Support** - Chequing, Savings, and Credit Card accounts

### 📊 Spending Insights
- **Interactive Pie Charts** - Visual breakdown of spending by category
- **Budget Tracking** - Progress bars showing monthly spending vs budget
- **Transaction Categorization** - Automatic categorization of transactions

### 💸 e-Transfer System
- **Send Money** - Full e-Transfer flow with recipient management
- **Inbox** - Pending transfers with deposit functionality
- **Real-time Updates** - Instant balance updates

### 📋 Bill Pay & Disputes
- **Scheduled Payments** - View and manage upcoming bills
- **Transaction Disputes** - Open and resolve dispute cases
- **Payment History** - Track past payments

### 🧪 Test Board (For Recruiters)
- **One-Click Demo Data** - Seed realistic transactions, contacts, and payees
- **Flow Triggers** - Create incoming e-Transfers, schedule bills, open disputes
- **Quick Navigation** - Jump to any module instantly

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts + Custom SVG |
| **State** | React Hooks + localStorage |
| **Deployment** | Vercel |

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/NehmanDevelops/Apex-Financial-Bank.git

# Navigate to the project
cd apex-financial

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with:
- **Email:** `demo@apex.ca`
- **Password:** `ApexSecure2025!`

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/           # Authenticated routes
│   │   ├── dashboard/   # Main dashboard
│   │   ├── accounts/    # Account details
│   │   ├── insights/    # Spending analytics
│   │   ├── etransfer/   # e-Transfer send/inbox
│   │   ├── bill-pay/    # Bill payments
│   │   ├── disputes/    # Transaction disputes
│   │   └── test-board/  # Recruiter demo tools
│   └── (auth)/          # Login/MFA pages
├── components/          # Reusable UI components
└── lib/
    └── demoStore.ts     # Client-side state management
```

## 🎨 Design Highlights

- **Modern Gradients** - Beautiful gradient backgrounds on cards and buttons
- **Micro-animations** - Hover effects, scale transitions, and loading states
- **Consistent Design System** - Cohesive color palette and typography
- **Responsive Layout** - Works on desktop and mobile devices
- **Accessibility** - Semantic HTML and proper ARIA attributes

## 📸 Screenshots

### Dashboard with Visual Cards
The dashboard features realistic credit card designs with chip effects, proper branding, and hover animations.

### Spending Insights
Interactive pie charts show spending breakdown by category with animated progress bars.

### Test Board
One-click buttons to generate demo data and test all application features.

## 👨‍💻 Author

**Nehman Develops**
- GitHub: [@NehmanDevelops](https://github.com/NehmanDevelops)

---

*This is a demo project created for portfolio purposes. Not affiliated with any real financial institution.*
