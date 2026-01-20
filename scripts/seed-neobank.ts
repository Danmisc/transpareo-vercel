
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Neo-Bank Data...')

    // 1. Get the first user (Demo User)
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error('No user found to seed.')
        return
    }

    // 2. Ensure Wallet exists with NeoBank fields
    console.log(`Updating Wallet for user ${user.id}...`)
    const wallet = await prisma.wallet.upsert({
        where: { userId: user.id },
        update: {
            iban: "FR76 1234 5678 9012 3456 7890 123",
            bic: "TRSPFR2P",
            tier: "METAL",
            status: "ACTIVE"
        },
        create: {
            userId: user.id,
            balance: 15420.50,
            currency: "EUR",
            iban: "FR76 1234 5678 9012 3456 7890 123",
            bic: "TRSPFR2P",
            tier: "METAL",
            status: "ACTIVE"
        }
    })

    // 3. Create Cards
    console.log('Creating Cards...')
    // Clean existing
    await prisma.bankCard.deleteMany({ where: { walletId: wallet.id } })

    // Virtual Card (Online Shopping)
    await prisma.bankCard.create({
        data: {
            walletId: wallet.id,
            type: "VIRTUAL",
            status: "ACTIVE",
            design: "TEAL",
            label: "Online Shopping",
            panLast4: "4242",
            expiry: "12/28",
            cvv: "123", // Mock
            monthlyLimit: 2000,
            currentSpend: 450.20,
            onlinePayments: true,
            contactless: false,
            atmWithdrawals: false
        }
    })

    // Physical Card (Metal)
    await prisma.bankCard.create({
        data: {
            walletId: wallet.id,
            type: "PHYSICAL",
            status: "ACTIVE",
            design: "METAL",
            label: "Metal Card",
            panLast4: "8899",
            expiry: "09/29",
            pin: "1234",
            monthlyLimit: 10000,
            currentSpend: 1250.00,
            onlinePayments: true,
            contactless: true,
            atmWithdrawals: true
        }
    })

    // 4. Create Pockets (Vaults)
    console.log('Creating Pockets...')
    await prisma.pocket.deleteMany({ where: { walletId: wallet.id } })

    await prisma.pocket.create({
        data: {
            walletId: wallet.id,
            name: "Vacances Bali 🌴",
            goalAmount: 5000,
            balance: 1250,
            emoji: "🌴",
            autoSaveEnabled: true,
            roundUpMultiplier: 2.0
        }
    })

    await prisma.pocket.create({
        data: {
            walletId: wallet.id,
            name: "Impôts & Charges 🏛️",
            goalAmount: 10000,
            balance: 3400,
            emoji: "🏛️",
            autoSaveEnabled: false
        }
    })

    // 5. Generate Neo-Bank Transactions (Card Payments, Subscriptions)
    console.log('Generating Neo-Bank Transactions...')
    // Clear old "OTHER" transactions to clean up
    // await prisma.transaction.deleteMany({ where: { walletId: wallet.id, type: "CARD_PAYMENT" } }) 

    // Netflix Subscription
    await prisma.transaction.create({
        data: {
            walletId: wallet.id,
            amount: -19.99,
            type: "SUBSCRIPTION",
            category: "SUBSCRIPTION",
            status: "COMPLETED",
            description: "Netflix Premium",
            counterpartyName: "Netflix",
            counterpartyLogo: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.png",
            isRecurring: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
    })

    // Apple Store
    await prisma.transaction.create({
        data: {
            walletId: wallet.id,
            amount: -2.99,
            type: "CARD_PAYMENT",
            category: "SERVICES",
            status: "COMPLETED",
            description: "iCloud Storage",
            counterpartyName: "Apple Services",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
    })

    // Uber Ride
    await prisma.transaction.create({
        data: {
            walletId: wallet.id,
            amount: -14.50,
            type: "CARD_PAYMENT",
            category: "TRANSPORT",
            status: "COMPLETED",
            description: "Uber Ride",
            counterpartyName: "Uber",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        }
    })

    console.log('✅ Neo-Bank Seeding Completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
