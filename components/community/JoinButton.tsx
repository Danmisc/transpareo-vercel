"use client";

import { Button } from "@/components/ui/button";
import { joinCommunity, leaveCommunity } from "@/lib/community-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinButton({ communityId, userId, isMember }: { communityId: string, userId: string, isMember: boolean }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        setLoading(true);
        try {
            if (isMember) {
                await leaveCommunity(communityId, userId);
            } else {
                await joinCommunity(communityId, userId);
            }
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={isMember ? "outline" : "default"}
            onClick={handleToggle}
            disabled={loading}
        >
            {loading ? "..." : (isMember ? "Quitter" : "Rejoindre")}
        </Button>
    );
}

