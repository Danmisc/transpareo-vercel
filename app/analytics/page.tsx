import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { analyticsService, AnalyticsPeriod } from "@/lib/services/analytics.service";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata = {
    title: "Statistiques | Transpareo",
    description: "Analysez les performances de votre profil et de vos publications"
};

interface PageProps {
    searchParams: Promise<{ period?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const params = await searchParams;
    const userId = session.user.id;
    const period = (params.period as AnalyticsPeriod) || "28D";

    // Fetch all analytics data in parallel
    const [
        profileAnalytics,
        contentAnalytics,
        postAnalytics,
        topPosts,
        engagementTrend,
        audienceInsights,
        realEstateAnalytics
    ] = await Promise.all([
        analyticsService.getProfileAnalytics(userId, period),
        analyticsService.getContentAnalytics(userId, period),
        analyticsService.getPostAnalytics(userId, period, 10),
        analyticsService.getTopPosts(userId, 5),
        analyticsService.getEngagementTrend(userId, period),
        analyticsService.getAudienceInsights(userId),
        analyticsService.getRealEstateAnalytics(userId, period)
    ]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header />

            <main className="container max-w-7xl mx-auto px-4 py-8 pt-24">
                <AnalyticsDashboard
                    userId={userId}
                    currentPeriod={period}
                    profileAnalytics={profileAnalytics}
                    contentAnalytics={contentAnalytics}
                    postAnalytics={postAnalytics}
                    topPosts={topPosts}
                    engagementTrend={engagementTrend}
                    audienceInsights={audienceInsights}
                    realEstateAnalytics={realEstateAnalytics}
                />
            </main>
        </div>
    );
}

