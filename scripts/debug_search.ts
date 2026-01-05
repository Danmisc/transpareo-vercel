
import { searchService } from "../lib/services/search.service";
import { prisma } from "../lib/prisma";

async function main() {
    console.log("--- DEBUGGING SEARCH SERVICE ---");

    // 1. Create a dummy video post if not exists
    const user = await prisma.user.findFirst();
    if (user) {
        await prisma.post.create({
            data: {
                content: "Debug Video Post",
                authorId: user.id,
                published: true,
                video: {
                    create: {
                        url: "http://example.com/video.mp4"
                    }
                }
            }
        });
        console.log("Created/Ensured Debug Video Post");
    }

    // 2. Test Video Filter
    console.log("\nTesting Video Filter (contentType='Vidéo')...");
    const videoResults = await searchService.search("Debug", "posts", { contentType: "Vidéo" });
    console.log(`Found ${videoResults.posts.length} video posts.`);
    videoResults.posts.forEach(p => console.log(` - [${p.id}] Video: ${p.video ? 'YES' : 'NO'}`));

    // 3. Test Image Filter
    console.log("\nTesting Image Filter (contentType='Image')...");
    const imageResults = await searchService.search("Debug", "posts", { contentType: "Image" });
    console.log(`Found ${imageResults.posts.length} image posts.`);

    // 4. Test Date Filter
    console.log("\nTesting Date Filter (date='today')...");
    const dateResults = await searchService.search("Debug", "posts", { date: "today" });
    console.log(`Found ${dateResults.posts.length} recent posts.`);

    console.log("\n--- END DEBUG ---");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
