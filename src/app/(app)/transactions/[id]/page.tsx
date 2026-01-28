import { TransactionDetailClient } from "./transactionDetailClient";

export async function generateStaticParams() {
  // Generate a few IDs so the build passes and some pages exist
  return [
    { id: "tx1" },
    { id: "tx2" },
    { id: "tx3" },
    { id: "tx4" },
    { id: "tx5" },
    { id: "tx6" },
    { id: "tx7" }
  ];
}

export default function TransactionDetailPage({ params }: { params: { id: string } }) {
  // Mock data for the static page shells
  const mockTx = {
    id: params.id,
    description: "Sample Transaction",
    merchant: "Retailer",
    memo: "Demo data",
    amount: 10.00,
    type: "DEBIT" as const,
    status: "POSTED" as const,
    date: new Date().toISOString(),
    accountNumber: "000-1234"
  };

  return <TransactionDetailClient tx={mockTx} dispute={null} displayAmount="-$10.00" />;
}
