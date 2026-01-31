import { auth } from "@/lib/auth";
import { getCommunityDetailsForManagement, getCommunityReports, getModerationLogs } from "@/lib/community-management-actions";
import { redirect } from "next/navigation";
import ModerationClient from "./moderation-client";

export default async function ManageModerationPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const { slug } = await params;
    const { success, data: community } = await getCommunityDetailsForManagement(slug, session.user.id);
    if (!success || !community) return redirect("/communities");

    const [reportsResult, logsResult] = await Promise.all([
        getCommunityReports(community.id, session.user.id),
        getModerationLogs(community.id, session.user.id)
    ]);

    return (
        <ModerationClient
            communityId={community.id}
            currentUserId={session.user.id}
            reports={reportsResult.data || []}
            logs={logsResult.data || []}
        />
    );
}
