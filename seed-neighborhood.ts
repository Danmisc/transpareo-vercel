import { prisma } from "./lib/prisma";

async function main() {
    console.log("Seeding Neighborhood...");

    // 1. Create Neighborhood "Paris 11 - Bastille"
    const neighborhood = await prisma.community.upsert({
        where: { slug: "paris-11-bastille" },
        update: {},
        create: {
            name: "Paris 11 - Bastille",
            slug: "paris-11-bastille",
            description: "Le cœur vibrant de l'Est parisien. Bars, culture et vie de quartier.",
            type: "NEIGHBORHOOD",
            city: "Paris",
            zipCode: "75011",
            image: "https://images.unsplash.com/photo-1550340499-a6c60886a420?q=80&w=2070&auto=format&fit=crop",
            coverImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
            updatedAt: new Date(),
            creator: {
                connect: { email: "alice@example.com" } // Ensure this user exists or use another strategy
            }
        }
    });

    console.log("Neighborhood created:", neighborhood.name);

    // 2. Add some Vibe Reviews
    // Check if user exists first
    const user = await prisma.user.findFirst();
    if (user) {
        await prisma.vibeReview.create({
            data: {
                communityId: neighborhood.id,
                userId: user.id,
                safetyRating: 4,
                noiseRating: 2, // Noisy
                transportRating: 5, // Metro everywhere
                comment: "Super quartier pour sortir, un peu bruyant rue de la Roquette."
            }
        }).catch(() => console.log("Review already exists"));
    }

    // 3. Add a Question Post
    if (user) {
        await prisma.post.create({
            data: {
                content: "Bonjour les voisins 👋 Je cherche une bonne boulangerie vers Ledru-Rollin, des recommandations ?",
                type: "QUESTION",
                communityId: neighborhood.id,
                authorId: user.id
            }
        });
    }

    console.log("Seeding done!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
