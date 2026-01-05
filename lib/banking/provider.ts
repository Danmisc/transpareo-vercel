import { prisma } from "@/lib/prisma";

export type OperationType = "CREDIT" | "DEBIT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "BLOCKED";

export interface IBankingProvider {
    createWallet(userId: string): Promise<string>; // Returns Wallet ID
    createIBAN(walletId: string): Promise<{ iban: string; bic: string }>;
    processTransfer(from: string, to: string, amount: number): Promise<string>; // Returns Tx ID
    validateIBAN(iban: string): boolean;
}

// Mock Implementation (Switchable to MangoPayProvider later)
export class MockBankingProvider implements IBankingProvider {
    async createWallet(userId: string) {
        return `WALLET_${userId}_${Date.now()}`;
    }

    async createIBAN(walletId: string) {
        // Generate realistic FR76 IBAN
        return {
            iban: `FR76 1234 5678 9012 3456 7890 123`,
            bic: "TRSPFR2P"
        };
    }

    async processTransfer(from: string, to: string, amount: number) {
        return `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    validateIBAN(iban: string) {
        return iban.startsWith("FR") && iban.length === 27;
    }
}

export const bankingProvider = new MockBankingProvider();
