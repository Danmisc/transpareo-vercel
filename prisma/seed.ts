import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Clean up
    await prisma.interaction.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()

    // Create Users
    const me = await prisma.user.create({
        data: {
            email: 'me@example.com',
            name: 'Moi Même',
            role: 'PRO',
            avatar: '/avatars/01.png',
        },
    })

    const userA = await prisma.user.create({
        data: {
            email: 'sophie@design.com',
            name: 'Sophie Dubreuil',
            role: 'PRO',
            avatar: '/avatars/03.png',
        },
    })

    const userB = await prisma.user.create({
        data: {
            email: 'marc@proprietaire.com',
            name: 'Marc Levy',
            role: 'USER',
            avatar: '/avatars/04.png',
        },
    })

    const userC = await prisma.user.create({
        data: {
            email: 'transpareo@official.com',
            name: 'Transpareo Official',
            role: 'ADMIN',
            avatar: '/favicons/favicon.ico',
        }
    })

    // Create Posts
    // 1. Viral Post (Older but high engagement)
    const viralPost = await prisma.post.create({
        data: {
            content: "La rénovation énergétique est le sujet clé de 2024. Voici mon guide complet pour obtenir MaPrimeRénov ! 🌿🏠 #Renovation #Ecologie",
            authorId: userA.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
            interactions: {
                create: [
                    { type: 'LIKE', userId: userB.id },
                    { type: 'SHARE', userId: userB.id },
                    { type: 'SAVE', userId: me.id },
                    { type: 'LIKE', userId: me.id },
                ]
            },
            comments: {
                create: [
                    { content: "Super utile, merci Sophie !", userId: userB.id },
                    { content: "J'ai partagé à mon réseau.", userId: me.id }
                ]
            }
        },
    })

    // 2. Fresh Post (User B)
    const freshPost = await prisma.post.create({
        data: {
            content: "Question aux experts : Pompe à chaleur ou chaudière biomasse pour un immeuble de 1930 ?",
            authorId: userB.id,
            published: true,
            interactions: {
                create: [{ type: 'LIKE', userId: userA.id }]
            }
        }
    })

    // 3. Official Post (Welcome)
    await prisma.post.create({
        data: {
            content: "Bienvenue sur la version Bêta de Transpareo Social ! Signalez-nous le moindre bug. 🐛",
            authorId: userC.id,
            image: "welcome",
        }
    })

    // 4. Content Type Examples for Phase 3

    // A. Markdown Post
    await prisma.post.create({
        data: {
            content: `# 5 Conseils Rénovation\n\nVoici ma liste pour bien démarrer :\n1. **Isoler les combles** (Priorité 1)\n2. Changer les fenêtres\n3. _Ventilation_ (VMC double flux)\n\n> "L'énergie la moins chère est celle qu'on ne consomme pas."`,
            authorId: userA.id,
            type: "TEXT",
        }
    })

    // B. Poll Post
    await prisma.post.create({
        data: {
            content: "Quel est le meilleur isolant phonique selon vous ?",
            authorId: userA.id,
            type: "POLL",
            metadata: JSON.stringify({
                options: ["Laine de roche", "Liège", "Ouate de cellulose", "Autre"],
                votes: { 0: 12, 1: 5, 2: 8, 3: 1 }
            })
        }
    })

    // C. Video Post
    await prisma.post.create({
        data: {
            content: "Visite rapide du chantier Saint-Lazare. On attaque la peinture ! 🎨",
            authorId: userB.id,
            type: "VIDEO",
            metadata: JSON.stringify({
                duration: "0:45",
                views: 1240
            })
        }
    })

    // D. Property Listing Post
    await prisma.post.create({
        data: {
            content: "Un bijou rare à Paris 11ème. Loft industriel 85m². À visiter d'urgence.",
            authorId: me.id,
            type: "PROPERTY",
            image: "loft-lyon",
            metadata: JSON.stringify({
                price: "850 000 €",
                location: "Paris 11e",
                surface: "85m²",
                rooms: 3
            })
        }
    })

    console.log({ me, userA, userB, viralPost, freshPost })
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
