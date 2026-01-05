"use client";

import { ArrowRight } from "lucide-react";
import { FollowSuggestions } from "@/components/profile/FollowSuggestions";
import { TrendingTags } from "@/components/discovery/TrendingTags";
import { useSession } from "next-auth/react";
import { RecommendedListings } from "@/components/feed/RecommendedListings";
import { OnlineFriendsWidget } from "@/components/feed/OnlineFriendsWidget";
import { ProBanner } from "@/components/feed/ProBanner";
import { EventsWidget } from "@/components/feed/EventsWidget";
import { GoLiveButton } from "@/components/feed/GoLiveButton";

export function SidebarRight() {
    const { data: session } = useSession();

    return (
        <div className="space-y-6 py-4">

            <ProBanner />
            <OnlineFriendsWidget />
            <EventsWidget />
            <TrendingTags />
            <RecommendedListings userId={session?.user?.id} />
            <FollowSuggestions />

            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                <GoLiveButton userId={session?.user?.id} variant="default" className="w-full" />
                <p className="text-[10px] text-center text-muted-foreground mt-2">Partagez votre expertise en direct</p>
            </div>
        </div>
    );
}
