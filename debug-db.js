
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const properties = await prisma.property.findMany();
    console.log("ALL PROPERTIES IN DB:", properties);

    const users = await prisma.user.findMany();
    console.log("ALL USERS:", users.map(u => ({ id: u.id, email: u.email })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
