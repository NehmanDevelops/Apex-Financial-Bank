// Client-side demo data store using localStorage
// All demo data is stored here and shared across components

export interface DemoTransaction {
    id: string;
    accountId: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
    description: string;
    date: string;
    status: "POSTED" | "PENDING";
    accountType: "CHEQUING" | "SAVINGS" | "CREDIT_CARD";
}

export interface DemoETransfer {
    id: string;
    fromName: string;
    amount: number;
    date: string;
    status: "PENDING" | "DEPOSITED";
    message?: string;
}

export interface DemoBillPayment {
    id: string;
    payee: string;
    amount: number;
    dueDate: string;
    status: "SCHEDULED" | "PAID";
}

export interface DemoDispute {
    id: string;
    transactionDescription: string;
    amount: number;
    date: string;
    status: "OPEN" | "RESOLVED";
    reason: string;
}

export interface DemoContact {
    id: string;
    name: string;
    email: string;
}

export interface DemoPayee {
    id: string;
    name: string;
    accountNumber: string;
}

// Initial demo data
const initialTransfers: DemoETransfer[] = [
    { id: "t1", fromName: "John Smith", amount: 150.00, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: "PENDING" },
    { id: "t2", fromName: "Jane Doe", amount: 75.00, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "PENDING" },
];

const initialBills: DemoBillPayment[] = [
    { id: "b1", payee: "Hydro Ottawa", amount: 112.66, dueDate: "2025-01-15", status: "SCHEDULED" },
    { id: "b2", payee: "Rogers Wireless", amount: 85.00, dueDate: "2025-01-20", status: "SCHEDULED" },
];

const initialDisputes: DemoDispute[] = [];

const initialContacts: DemoContact[] = [
    { id: "c1", name: "John Smith", email: "john@email.com" },
    { id: "c2", name: "Jane Doe", email: "jane@email.com" },
    { id: "c3", name: "Bob Wilson", email: "bob@email.com" },
];

const initialPayees: DemoPayee[] = [
    { id: "p1", name: "Hydro Ottawa", accountNumber: "1234567" },
    { id: "p2", name: "Rogers Wireless", accountNumber: "7654321" },
    { id: "p3", name: "Netflix", accountNumber: "9876543" },
    { id: "p4", name: "Amazon Prime", accountNumber: "1357924" },
    { id: "p5", name: "Spotify", accountNumber: "2468135" },
];

const initialTransactions: DemoTransaction[] = [
    { id: "tx1", accountId: "1", amount: 2860.00, type: "CREDIT", description: "Payroll Deposit", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
    { id: "tx2", accountId: "1", amount: 8.45, type: "DEBIT", description: "Starbucks", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
    { id: "tx3", accountId: "1", amount: 24.18, type: "DEBIT", description: "Uber", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
    { id: "tx4", accountId: "1", amount: 112.66, type: "DEBIT", description: "Hydro Bill", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
    { id: "tx5", accountId: "1", amount: 75.00, type: "DEBIT", description: "Interac e-Transfer", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: "PENDING", accountType: "CHEQUING" },
    { id: "tx6", accountId: "2", amount: 500.00, type: "CREDIT", description: "Monthly Savings Transfer", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "SAVINGS" },
    { id: "tx7", accountId: "3", amount: 61.92, type: "DEBIT", description: "Amazon Marketplace", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CREDIT_CARD" },
];

// Helper to safely access localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveToStorage<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage errors
    }
}

// Data access functions
export function getETransfers(): DemoETransfer[] {
    return getFromStorage("demo-etransfers", initialTransfers);
}

export function addETransfer(transfer: Omit<DemoETransfer, "id">): DemoETransfer {
    const transfers = getETransfers();
    const newTransfer: DemoETransfer = { ...transfer, id: `t${Date.now()}` };
    transfers.unshift(newTransfer);
    saveToStorage("demo-etransfers", transfers);
    return newTransfer;
}

export function depositETransfer(id: string): void {
    const transfers = getETransfers();
    const index = transfers.findIndex(t => t.id === id);
    if (index !== -1) {
        transfers[index].status = "DEPOSITED";
        saveToStorage("demo-etransfers", transfers);
    }
}

export function getBillPayments(): DemoBillPayment[] {
    return getFromStorage("demo-bills", initialBills);
}

export function addBillPayment(bill: Omit<DemoBillPayment, "id">): DemoBillPayment {
    const bills = getBillPayments();
    const newBill: DemoBillPayment = { ...bill, id: `b${Date.now()}` };
    bills.unshift(newBill);
    saveToStorage("demo-bills", bills);
    return newBill;
}

export function getDisputes(): DemoDispute[] {
    return getFromStorage("demo-disputes", initialDisputes);
}

export function addDispute(dispute: Omit<DemoDispute, "id">): DemoDispute {
    const disputes = getDisputes();
    const newDispute: DemoDispute = { ...dispute, id: `d${Date.now()}` };
    disputes.unshift(newDispute);
    saveToStorage("demo-disputes", disputes);
    return newDispute;
}

export function getContacts(): DemoContact[] {
    return getFromStorage("demo-contacts", initialContacts);
}

export function addContacts(newContacts: Omit<DemoContact, "id">[]): void {
    const contacts = getContacts();
    const toAdd = newContacts.map((c, i) => ({ ...c, id: `c${Date.now()}${i}` }));
    contacts.push(...toAdd);
    saveToStorage("demo-contacts", contacts);
}

export function getPayees(): DemoPayee[] {
    return getFromStorage("demo-payees", initialPayees);
}

export function addPayees(newPayees: Omit<DemoPayee, "id">[]): void {
    const payees = getPayees();
    const toAdd = newPayees.map((p, i) => ({ ...p, id: `p${Date.now()}${i}` }));
    payees.push(...toAdd);
    saveToStorage("demo-payees", payees);
}

export function getTransactions(): DemoTransaction[] {
    return getFromStorage("demo-transactions", initialTransactions);
}

export function addTransactions(newTxns: Omit<DemoTransaction, "id">[]): void {
    const txns = getTransactions();
    const toAdd = newTxns.map((t, i) => ({ ...t, id: `tx${Date.now()}${i}` }));
    txns.unshift(...toAdd);
    saveToStorage("demo-transactions", txns);
}

export function getLatestDebit(): DemoTransaction | null {
    const txns = getTransactions();
    return txns.find(t => t.type === "DEBIT") || null;
}

// Get counts for test board
export function getDemoCounts() {
    return {
        contacts: getContacts().length,
        payees: getPayees().length,
        transfersPending: getETransfers().filter(t => t.status === "PENDING").length,
        scheduled: getBillPayments().filter(b => b.status === "SCHEDULED").length,
        disputes: getDisputes().length,
        transactions: getTransactions().length,
    };
}

// Seed additional demo data
export function seedDemoData(): void {
    // Add more contacts
    addContacts([
        { name: "Sarah Miller", email: "sarah@email.com" },
        { name: "Mike Johnson", email: "mike@email.com" },
        { name: "Lisa Chen", email: "lisa@email.com" },
        { name: "David Brown", email: "david@email.com" },
        { name: "Emma Wilson", email: "emma@email.com" },
    ]);

    // Add more payees
    addPayees([
        { name: "Bell Canada", accountNumber: "5551234" },
        { name: "Enbridge Gas", accountNumber: "5557890" },
        { name: "TD Insurance", accountNumber: "5554567" },
    ]);

    // Add more transactions
    const newTxns: Omit<DemoTransaction, "id">[] = [
        { accountId: "1", amount: 45.99, type: "DEBIT", description: "Uber Eats", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
        { accountId: "1", amount: 129.00, type: "DEBIT", description: "Costco", date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
        { accountId: "3", amount: 15.99, type: "DEBIT", description: "Netflix", date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CREDIT_CARD" },
        { accountId: "3", amount: 9.99, type: "DEBIT", description: "Spotify", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CREDIT_CARD" },
        { accountId: "1", amount: 55.00, type: "DEBIT", description: "Gas Station", date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), status: "POSTED", accountType: "CHEQUING" },
    ];
    addTransactions(newTxns);
}
