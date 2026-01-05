
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Testing Prisma Client...");
    try {
        const kyc = await prisma.kYCProfile.findFirst();
        // Note: checking capitalized and lowercase variants to be safe, 
        // but typically it is camelCase properties on the client.
        // Actually, let's inspect the keys.

        console.log("Client keys:", Object.keys(prisma));

        // Try accessing the property directly
        // @ts-ignore
        if (prisma.kycProfile) {
            console.log("kycProfile exists on client.");
        } else {
            console.error("kycProfile DOES NOT EXIST on client.");
        }

        // @ts-ignore
        if (prisma.wallet) {
            console.log("wallet exists on client.");
        } else {
            console.error("wallet DOES NOT EXIST on client.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
