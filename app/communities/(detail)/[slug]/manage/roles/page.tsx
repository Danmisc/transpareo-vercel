import { getCommunityDetailsForManagement, getCommunityRoles } from "@/lib/community-management-actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RolesClient } from "./roles-client";

export default async function ManageRolesPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const { slug } = await params;
    const { success, data: community } = await getCommunityDetailsForManagement(slug, session.user.id);

    if (!success || !community) return redirect("/communities");

    const { data: roles } = await getCommunityRoles(community.id, session.user.id);

    return <RolesClient communityId={community.id} userId={session.user.id} initialRoles={roles || []} />;
}
