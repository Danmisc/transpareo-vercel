const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Create a test user
    const user = await prisma.user.upsert({
        where: { email: 'test@test.com' },
        update: {},
        create: {
            email: 'test@test.com',
            name: 'Test User',
            currentPlan: 'FREE'
        }
    });

    console.log('✅ Created/Found user:', user.id, user.email);

    // Create a test post
    const post = await prisma.post.create({
        data: {
            content: 'Premier post de test! 🎉',
            authorId: user.id,
            type: 'TEXT'
        }
    });

    console.log('✅ Created post:', post.id);

    await prisma.$disconnect();
}

main().catch(console.error);
