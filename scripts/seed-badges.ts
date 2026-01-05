
import { seedBadges } from "../lib/gamification";
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Starting badge seeding...");
    await seedBadges();
    console.log("Done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
