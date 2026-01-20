import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export enum LedgerAccountType {
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    EQUITY = "EQUITY",
    REVENUE = "REVENUE",
    EXPENSE = "EXPENSE"
}

export enum TransactionDirection {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}

/**
 * Creates a new Ledger Account.
 */
export async function createLedgerAccount(input: {
    name: string;
    type: LedgerAccountType;
    currency?: string;
    walletId?: string; // Optional: Link to a UI Wallet
}) {
    return prisma.ledgerAccount.create({
        data: {
            name: input.name,
            type: input.type,
            currency: input.currency || "EUR",
            wallet: input.walletId ? { connect: { id: input.walletId } } : undefined
        }
    });
}

/**
 * Records a Double-Entry Journal Transaction.
 * Ensures strict equality of Debits and Credits.
 */
export async function recordJournalEntry(input: {
    description: string;
    lines: {
        accountId: string;
        amount: number; // Positive Decimal
        direction: "DEBIT" | "CREDIT";
    }[];
    reference?: string;
    transactionId?: string; // Optional: Link to UI Transaction
}) {
    const { description, lines, reference, transactionId } = input;

    // 1. Validation: Sum(Debits) == Sum(Credits)
    const totalDebit = lines
        .filter(l => l.direction === "DEBIT")
        .reduce((sum, l) => sum + l.amount, 0);

    const totalCredit = lines
        .filter(l => l.direction === "CREDIT")
        .reduce((sum, l) => sum + l.amount, 0);

    // Allow small floating point tolerance if using numbers, 
    // but banking requires Decimals. For now we use EPSILON check on number input.
    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
        throw new Error(`Ledger Imbalance: Debits (${totalDebit}) != Credits (${totalCredit})`);
    }

    // 2. Execute Transaction
    return prisma.$transaction(async (tx) => {
        // Create Journal Entry
        const entry = await tx.journalEntry.create({
            data: {
                description,
                reference,
                transactionId,
                status: "POSTED",
                lines: {
                    create: lines.map(line => ({
                        accountId: line.accountId,
                        amount: line.amount,
                        direction: line.direction
                    }))
                }
            }
        });

        // Update Account Balances
        for (const line of lines) {
            const account = await tx.ledgerAccount.findUniqueOrThrow({ where: { id: line.accountId } });

            // Calculate impact based on Account Type and Direction
            // Asset/Expense: Debit (+), Credit (-)
            // Liability/Equity/Revenue: Debit (-), Credit (+)

            let impact = 0;
            const isNormalDebit = [LedgerAccountType.ASSET, LedgerAccountType.EXPENSE].includes(account.type as LedgerAccountType);

            if (isNormalDebit) {
                impact = line.direction === "DEBIT" ? line.amount : -line.amount;
            } else {
                impact = line.direction === "CREDIT" ? line.amount : -line.amount;
            }

            const updatedAccount = await tx.ledgerAccount.update({
                where: { id: line.accountId },
                data: {
                    balance: { increment: impact }
                }
            });

            // Update line snapshot
            // Note: We need to find the specific created line ID, but creates inside nested writes don't return IDs easily.
            // For now, we accept that 'balanceAfter' might not be perfectly snapshot on the line in this implementation 
            // without a separate query. We'll skip specific line snapshot for performance or add it later.
        }

        return entry;
    });
}

/**
 * Helper to get System Accounts (Singleton Pattern-ish)
 */
export async function getSystemAccount(name: "PLATFORM_BANK" | "PLATFORM_FEES" | "CLEARING") {
    const account = await prisma.ledgerAccount.findFirst({
        where: { name: name }
    });

    if (account) return account;

    // Initialize if missing
    let type = LedgerAccountType.ASSET;
    if (name === "PLATFORM_FEES") type = LedgerAccountType.REVENUE;

    return prisma.ledgerAccount.create({
        data: {
            name,
            type,
            currency: "EUR"
        }
    });
}
