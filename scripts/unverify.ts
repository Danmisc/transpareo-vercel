
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'altaf.daniel09@gmail.com';

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log(`User ${email} not found.`);
            return;
        }

        await prisma.user.update({
            where: { email },
            data: {
                emailVerified: null,
                twoFactorEnabled: false
            }
        });

        // Reset KYC
        await prisma.kYCProfile.deleteMany({
            where: { userId: user.id }
        });

        console.log(`Successfully reset emailVerified, 2FA, and KYC for ${email}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
