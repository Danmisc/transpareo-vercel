import { ReelsViewer } from "@/components/reels/ReelsViewer";
import { getReels } from "@/lib/actions";

export default async function ReelPage({ params }: { params: { id: string } }) {
    // Determine the initial reel to show based on ID
    // We could fetch a batch surrouding it, or just start infinite scroll from it.
    // For now, let's just pass the ID to the client viewer which will fetch.
    return (
        <div className="w-full h-screen bg-black">
            <ReelsViewer initialReelId={params.id} />
        </div>
    );
}
