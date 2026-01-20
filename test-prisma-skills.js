
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking UserSkill model...');
    try {
        if (!prisma.userSkill) {
            console.error('ERROR: prisma.userSkill is undefined!');
            process.exit(1);
        }
        console.log('prisma.userSkill exists.');

        // Check if table exists by counting
        const count = await prisma.userSkill.count();
        console.log('Current skill count:', count);

        // Try creating a dummy skill if a user exists
        const user = await prisma.user.findFirst();
        if (user) {
            console.log('Found user:', user.id);
            const skill = await prisma.userSkill.create({
                data: {
                    userId: user.id,
                    name: "Test Skill " + Date.now(),
                    category: "PROFESSIONAL"
                }
            });
            console.log('Successfully created skill:', skill);
            await prisma.userSkill.delete({ where: { id: skill.id } });
            console.log('Successfully deleted test skill.');
        } else {
            console.log('No user found to test creation.');
        }

    } catch (e) {
        console.error('Prisma Error:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
