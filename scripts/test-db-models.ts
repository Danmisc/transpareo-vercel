import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking available models on Prisma Client instance...')
    // Inspect the client object keys to see what's available
    // Note: Internal properties start with _, models usually start with lowercase or match schema

    const loanModel = (prisma as any).loan
    console.log('prisma.loan type:', typeof loanModel)

    if (loanModel) {
        console.log('SUCCESS: prisma.loan is defined.')
    } else {
        console.error('FAILURE: prisma.loan is UNDEFINED.')
        console.log('Available keys on prisma:', Object.keys(prisma))
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
