
import { prisma } from "@/lib/prisma";

async function verifyNeoBankData() {
    console.log("🔍 Verifying Neo-Bank Data...");

    const wallet = await prisma.wallet.findFirst({
        include: {
            cards: true,
            pockets: true,
            transactions: { take: 1 }
        }
    });

    if (!wallet) {
        console.error("❌ No wallet found!");
        return;
    }

    console.log(`✅ Wallet Found: ${wallet.id}`);
    console.log(`💳 Cards: ${wallet.cards.length}`);
    wallet.cards.forEach(c => console.log(`   - ${c.type} (${c.panLast4}) - ${c.status}`));

    console.log(`💰 Pockets: ${wallet.pockets.length}`);
    wallet.pockets.forEach(p => console.log(`   - ${p.name}: ${p.balance} / ${p.goalAmount}`));

    console.log(`📊 IBAN: ${wallet.iban}`);
}

verifyNeoBankData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
