
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error("Please provide an email address.")
        process.exit(1)
    }

    console.log(`Promoting ${email} to ADMIN...`)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        })
        console.log(`Success! User ${user.name} (${user.email}) is now an ADMIN.`)
    } catch (e) {
        console.error("Error updating user. Make sure the email exists.", e)
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
