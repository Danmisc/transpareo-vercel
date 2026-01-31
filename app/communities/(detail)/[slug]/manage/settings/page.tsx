import { auth } from "@/lib/auth";
import { getCommunityDetailsForManagement } from "@/lib/community-management-actions";
import { redirect } from "next/navigation";
import SettingsClient from "./settings-client";

export default async function ManageSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const { slug } = await params;
    const { success, data: community } = await getCommunityDetailsForManagement(slug, session.user.id);
    if (!success || !community) return redirect("/communities");

    return (
        <SettingsClient
            community={community}
            currentUserId={session.user.id}
        />
    );
}
