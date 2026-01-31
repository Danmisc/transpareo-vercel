import { getCommunityDetailsForManagement, getModerationLogs } from "@/lib/community-management-actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ActionCenter } from "./action-center";

export default async function ManageOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const { slug } = await params;
    const { success, data: community } = await getCommunityDetailsForManagement(slug, session.user.id);

    if (!success || !community) return redirect("/communities");

    // Fetch logs
    const { data: logs } = await getModerationLogs(community.id, session.user.id);

    const stats = {
        memberCount: community._count?.members || 0,
        postCount: community._count?.posts || 0,
        pendingReports: community._count?.reports || 0,
        pendingRequests: community._count?.joinRequests || 0,
        pendingInvites: community._count?.invitations || 0,
        slug: community.slug
    };

    return <ActionCenter stats={stats} logs={logs || []} />;
}
