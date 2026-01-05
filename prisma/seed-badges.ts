
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const badges = [
        {
            name: "Pionnier",
            slug: "pioneer",
            icon: "Flag",
            description: "Un des premiers membres de la plateforme.",
            condition: "Inscrit le premier mois",
            category: "GENERAL"
        },
        {
            name: "Voisin Solidaire",
            slug: "neighbor-help",
            icon: "Heart",
            description: "Aide activement sa communauté.",
            condition: "10 posts dans des communautés d'entraide",
            category: "COMMUNITY"
        },
        {
            name: "Expert Local",
            slug: "local-expert",
            icon: "MapPin",
            description: "Connaît son quartier comme sa poche.",
            condition: "20 posts ou commentaires géolocalisés",
            category: "COMMUNITY"
        },
        {
            name: "Pro Vérifié",
            slug: "verified-pro",
            icon: "Briefcase",
            description: "Professionnel de l'immobilier vérifié.",
            condition: "Compte Pro validé",
            category: "PRO"
        },
        {
            name: "Top Contributeur",
            slug: "top-contributor",
            icon: "Star",
            description: "Membre très actif et apprécié.",
            condition: "Réputation > 500",
            category: "GENERAL"
        }
    ]

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { slug: badge.slug },
            update: {},
            create: badge
        })
    }

    console.log("Badges seeded!")
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
