"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "fr";

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Header
        "secureOnlineBanking": "Secure Online Banking",

        // Dashboard
        "dashboard": "Dashboard",
        "goodMorning": "Good Morning",
        "goodAfternoon": "Good Afternoon",
        "goodEvening": "Good Evening",
        "yourCards": "Your Cards",
        "recentTransactions": "Recent Transactions",
        "spendingAnalytics": "Spending Analytics",
        "whereYourMoneyWent": "Where your money went",
        "transactions": "transactions",
        "privacyMode": "Privacy Mode",
        "forRecruiters": "FOR RECRUITERS/INTERVIEWERS: TESTBOARD",
        "seedDemoData": "Seed demo data, trigger flows (e-Transfer, bill pay, insights, disputes), and explore everything in one place.",
        "openTestBoard": "Open Test Board",

        // Accounts
        "chequing": "Chequing",
        "savings": "Savings",
        "visaInfinite": "Visa Infinite",
        "availableBalance": "Available Balance",
        "currentBalance": "Current Balance",
        "cardHolder": "Card Holder",

        // Sidebar
        "accounts": "Accounts",
        "moveMoney": "Move Money",
        "eTransfer": "e-Transfer",
        "sendMoney": "Send Money",
        "inbox": "Inbox",
        "billPay": "Bill Pay",
        "insightsCases": "Insights & Cases",
        "spendingInsights": "Spending Insights",
        "disputes": "Disputes",
        "adminTools": "Admin Tools",
        "fraudReview": "Fraud Review",
        "settings": "Settings",
        "testBoard": "Test Board",
        "signOut": "Sign Out",

        // Common
        "loading": "Loading...",
        "description": "Description",
        "account": "Account",
        "date": "Date",
        "status": "Status",
        "amount": "Amount",
    },
    fr: {
        // Header
        "secureOnlineBanking": "Services bancaires en ligne sécurisés",

        // Dashboard
        "dashboard": "Tableau de bord",
        "goodMorning": "Bonjour",
        "goodAfternoon": "Bon après-midi",
        "goodEvening": "Bonsoir",
        "yourCards": "Vos cartes",
        "recentTransactions": "Transactions récentes",
        "spendingAnalytics": "Analyse des dépenses",
        "whereYourMoneyWent": "Où est allé votre argent",
        "transactions": "transactions",
        "privacyMode": "Mode privé",
        "forRecruiters": "POUR LES RECRUTEURS: TABLEAU DE TEST",
        "seedDemoData": "Générer des données démo, déclencher des flux (virement, factures, analyses, litiges) et explorer toutes les fonctionnalités.",
        "openTestBoard": "Ouvrir le tableau de test",

        // Accounts
        "chequing": "Compte chèques",
        "savings": "Épargne",
        "visaInfinite": "Visa Infinite",
        "availableBalance": "Solde disponible",
        "currentBalance": "Solde actuel",
        "cardHolder": "Titulaire de la carte",

        // Sidebar
        "accounts": "Comptes",
        "moveMoney": "Transférer",
        "eTransfer": "Virement",
        "sendMoney": "Envoyer de l'argent",
        "inbox": "Boîte de réception",
        "billPay": "Payer les factures",
        "insightsCases": "Analyses & Cas",
        "spendingInsights": "Analyses des dépenses",
        "disputes": "Litiges",
        "adminTools": "Outils admin",
        "fraudReview": "Révision fraude",
        "settings": "Paramètres",
        "testBoard": "Tableau de test",
        "signOut": "Déconnexion",

        // Common
        "loading": "Chargement...",
        "description": "Description",
        "account": "Compte",
        "date": "Date",
        "status": "Statut",
        "amount": "Montant",
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("apex_lang") as Language | null;
        if (saved === "fr" || saved === "en") {
            setLangState(saved);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem("apex_lang", newLang);
    };

    const t = (key: string): string => {
        return translations[lang][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        // Return default values if not in provider
        return {
            lang: "en" as Language,
            setLang: () => { },
            t: (key: string) => translations.en[key] || key,
        };
    }
    return context;
}
