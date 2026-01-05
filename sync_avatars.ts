import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    for (const user of users) {
        if (user.avatar && !user.image) {
            await prisma.user.update({
                where: { id: user.id },
                data: { image: user.avatar }
            })
            console.log(`Updated user ${user.name}: image synced from avatar`)
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
