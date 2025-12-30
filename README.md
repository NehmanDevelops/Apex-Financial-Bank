# 🏦 Apex Financial - Modern Banking Demo

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com/)

A **full-featured banking demo application** showcasing modern frontend development skills. Built with Next.js 16, TypeScript, and Tailwind CSS with a focus on **premium UI/UX**, **realistic banking workflows**, and **complete interactivity**.

---

## ✨ Features

### 🔐 Authentication System
- Secure demo login with credential validation
- Session persistence with localStorage
- Automatic redirect protection for authenticated routes

### 💳 Dashboard & Accounts
- **Visual Credit Card UI** - Realistic card designs with chip, gradients, and Mastercard branding
- **Multi-account Display** - Chequing, Savings, and Credit Card accounts
- **Privacy Mode** - Toggle to hide sensitive balance information
- **Personalized Greeting** - Time-based welcome messages

### 📊 Spending Insights
- **Interactive Pie Chart** - SVG-based spending breakdown by category
- **Budget Tracking** - Visual progress bar for monthly budget
- **Category Analysis** - Color-coded spending categories with percentages
- **Recent Transactions** - Categorized transaction list

### 💸 e-Transfer System
- **Send Money Flow** - Complete form → confirmation → success flow
- **Recent Contacts** - Quick-select from saved contacts
- **Inbox** - View and deposit pending transfers
- **Real-time Updates** - Balance updates after transfers

### 📋 Bill Pay & Disputes
- **Scheduled Payments** - View and manage upcoming bills
- **Dispute Management** - Open and resolve transaction disputes
- **Status Tracking** - Visual status indicators

### 🧪 Test Board (For Recruiters)
- **One-Click Demo Data** - Seed realistic transactions, contacts, and payees
- **Flow Triggers** - Create incoming e-Transfers, schedule bills, open disputes
- **Real Persistence** - All data persists across navigation

### 🌙 Dark Mode
- **System-wide Toggle** - Works on login and all authenticated pages
- **Smooth Transitions** - Animated color transitions
- **Preference Persistence** - Saved to localStorage

### 🌐 Internationalization (i18n)
- **English/French Toggle** - Full translation support
- **Sidebar Translation** - All navigation items in French
- **Header Translation** - Localized security messages

### ⚡ Quick Actions
- **Floating Action Button (FAB)** - Quick access to common actions
- **Animated Menu** - Backdrop blur with smooth transitions
- **Direct Navigation** - Jump to e-Transfer, Bill Pay, Insights

### 🎨 Premium UI/UX
- **Custom Scrollbar** - Styled scrollbars for polished look
- **Hover Effects** - Scale and shadow transitions on cards
- **Loading Skeletons** - Smooth loading states
- **Responsive Design** - Works on desktop and mobile

---

## 🚀 Quick Start

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

Open [http://localhost:3000](http://localhost:3000) and log in with:

| Field | Value |
|-------|-------|
| **Email** | `demo@apex.ca` |
| **Password** | `ApexSecure2025!` |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts + Custom SVG |
| **State Management** | React Hooks + localStorage |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes
│   │   ├── dashboard/      # Main dashboard with cards
│   │   ├── accounts/       # Account details
│   │   ├── insights/       # Spending analytics & charts
│   │   ├── etransfer/      # Send & receive money
│   │   ├── bill-pay/       # Bill payments
│   │   ├── disputes/       # Transaction disputes
│   │   ├── test-board/     # Recruiter demo tools
│   │   └── settings/       # User preferences
│   └── (auth)/             # Login page
├── components/
│   ├── Sidebar.tsx         # Navigation with i18n
│   ├── TopBar.tsx          # Header with theme/lang toggle
│   ├── Footer.tsx          # Credits & links
│   ├── QuickActions.tsx    # Floating action button
│   └── ...
└── lib/
    └── demoStore.ts        # Client-side state management
```

---

## 🎨 Design Highlights

- **Modern Gradients** - Beautiful gradient backgrounds on cards
- **Micro-animations** - Hover effects, scale transitions, loading states
- **Consistent Design System** - Cohesive color palette based on RBC branding
- **Accessibility** - Semantic HTML and keyboard navigation
- **Dark Mode** - Full dark theme support

---

## 📸 Screenshots

### Dashboard with Visual Cards
Beautiful credit card designs with realistic chip and gradient effects.

### Spending Insights
Interactive pie chart with category-wise spending breakdown.

### e-Transfer Flow
Complete send flow with form validation and success animation.

---

## 🔗 Links

- **Live Demo**: Deployed on Vercel
- **Repository**: [github.com/NehmanDevelops/Apex-Financial-Bank](https://github.com/NehmanDevelops/Apex-Financial-Bank)

---

## 👨‍💻 Author

**Nehman Develops**  
GitHub: [@NehmanDevelops](https://github.com/NehmanDevelops)

---

*This is a demo project created for portfolio purposes. Not affiliated with any real financial institution.*
