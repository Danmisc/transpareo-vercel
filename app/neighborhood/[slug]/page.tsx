import { auth } from "@/lib/auth";
import { getNeighborhood } from "@/lib/actions/neighborhood";
import { redirect } from "next/navigation";
import { NeighborhoodHeader } from "@/components/neighborhood/NeighborhoodHeader";
import { NeighborhoodFeed } from "@/components/neighborhood/NeighborhoodFeed";
import { getCommunityPosts } from "@/lib/feed-service"; // Assuming this exists or using generic getFeed

export default async function NeighborhoodPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const session = await auth();
    const userId = session?.user?.id || "demo"; // Fallback for viewing

    const community = await getNeighborhood(slug);

    if (!community) {
        return <div className="p-10 text-center">Quartier introuvable</div>;
    }

    // Fetch Posts for this community
    // Reusing existing feed service, assuming we can filter by communityId
    // If not, we might need to add `getCommunityPosts` to `feed-service.ts`
    // mocking for now if it doesn't exist
    let posts = [];
    try {
        // posts = await getCommunityPosts(community.id); 
        // TEMPORARY: using empty list if function missing
        posts = [];
    } catch (e) {
        console.log("No posts or error", e);
    }

    const currentUser = session?.user ? {
        id: session.user.id,
        name: session.user.name,
        avatar: session.user.image
    } : { id: "demo", name: "Visiteur", avatar: "" };

    return (
        <div className="min-h-screen bg-zinc-50">
            <NeighborhoodHeader community={community} />
            <NeighborhoodFeed
                communityId={community.id}
                currentUser={currentUser}
                initialPosts={posts}
            />
        </div>
    );
}
