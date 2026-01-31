import { getCommunities } from "@/lib/community-actions";
import { auth } from "@/lib/auth";
import { CommunityDiscovery } from "@/components/community/CommunityDiscovery";

export default async function CommunitiesPage() {
    const session = await auth();
    // Fetch data server-side
    const { data: communities } = await getCommunities();

    return (
        <div className="min-h-full">
            <CommunityDiscovery initialCommunities={communities || []} />
        </div>
    );
}

