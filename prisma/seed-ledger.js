
const { PrismaClient } = require("@prisma/client");

// manual enum map
const LedgerType = {
    ASSET: "ASSET",
    LIABILITY: "LIABILITY",
    EQUITY: "EQUITY",
    REVENUE: "REVENUE",
    EXPENSE: "EXPENSE"
};

const prisma = new PrismaClient();

async function main() {
    console.log("🏦 Initializing Banking Core System Accounts (JS)...");

    const accounts = [
        { name: "PLATFORM_BANK", type: LedgerType.ASSET, currency: "EUR" },
        { name: "PLATFORM_FEES", type: LedgerType.REVENUE, currency: "EUR" },
        { name: "CLEARING_STRIPE", type: LedgerType.ASSET, currency: "EUR" },
        { name: "CLEARING_PLAID", type: LedgerType.ASSET, currency: "EUR" },
        { name: "PLATFORM_CAPITAL", type: LedgerType.EQUITY, currency: "EUR" },
    ];

    for (const acc of accounts) {
        const exists = await prisma.ledgerAccount.findFirst({ where: { name: acc.name } });
        if (!exists) {
            await prisma.ledgerAccount.create({
                data: {
                    name: acc.name,
                    type: acc.type,
                    currency: acc.currency,
                    balance: 0 // Initialize Decimal with 0
                }
            });
            console.log(`✅ Created ${acc.name}`);
        } else {
            console.log(`ℹ️  ${acc.name} already exists`);
        }
    }

    console.log("Banking Core Initialization Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
