import { auth } from "@/lib/auth";
import {
    getCommunityDetailsForManagement,
    getCommunityMembers,
    getCommunityInvites,
    getCommunityJoinRequests,
    getCommunityRoles
} from "@/lib/community-management-actions";
import { redirect } from "next/navigation";
import MembersClient from "./members-client";

export default async function ManageMembersPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const { slug } = await params;

    // 1. Get Community ID from slug
    const { success, data: community } = await getCommunityDetailsForManagement(slug, session.user.id);
    if (!success || !community) return redirect("/communities");

    // 2. Fetch all data needed for the tabs
    const [membersResult, invitesResult, requestsResult, rolesResult] = await Promise.all([
        getCommunityMembers(community.id, session.user.id),
        getCommunityInvites(community.id, session.user.id),
        getCommunityJoinRequests(community.id, session.user.id),
        getCommunityRoles(community.id, session.user.id)
    ]);

    if (!membersResult.success || !membersResult.data) {
        return <div>Failed to load members</div>;
    }

    return (
        <MembersClient
            communityId={community.id}
            initialMembers={membersResult.data}
            currentUserId={session.user.id}
            initialInvites={invitesResult.success ? invitesResult.data : []}
            initialRequests={requestsResult.success ? requestsResult.data : []}
            roles={rolesResult.success ? rolesResult.data : []}
            totalPages={membersResult.pages || 1}
        />
    );
}
