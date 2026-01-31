import { auth } from "@/lib/auth";
import { getCommunityDetailsForManagement, getAdvancedCommunityAnalytics } from "@/lib/community-management-actions";
import { redirect } from "next/navigation";
import AnalyticsClient from "./analytics-client";

export default async function ManageAnalyticsPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    const { slug } = await params;
    const { period, from, to } = await searchParams;

    const { success, data: community } = await getCommunityDetailsForManagement(slug, session.user.id);
    if (!success || !community) return redirect("/communities");

    const selectedPeriod = (period === "7d" || period === "30d" || period === "90d" || period === "custom") ? period : "30d";

    const analytics = await getAdvancedCommunityAnalytics(community.id, session.user.id, selectedPeriod, from, to);

    if (!analytics.success || !analytics.data) {
        return <div>Impossible de charger les statistiques.</div>;
    }

    return (
        <AnalyticsClient
            data={analytics.data.series}
            summary={analytics.data.summary}
            period={selectedPeriod}
            customFrom={from}
            customTo={to}
        />
    );
}
