import { useState, useRef } from "react";
import { SmartVideoPlayer } from "@/components/video/SmartVideoPlayer";
import { ReelOverlay } from "@/components/reels/ReelOverlay";
import { toggleReaction } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { CommentsSheet } from "@/components/reels/CommentsSheet";
import { PropertySheet } from "@/components/reels/PropertySheet";
import { AutoCaptions } from "@/components/reels/AutoCaptions";

import { useRouter } from "next/navigation";
import { useDrag } from "@use-gesture/react";
import { useHaptic } from "@/hooks/use-haptic";
import { useWatchTime } from "@/hooks/use-watch-time";
import { cn } from "@/lib/utils";

interface SingleReelProps {
    post: any;
    isActive: boolean;
}

export function SingleReel({ post, isActive }: SingleReelProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { trigger: haptic } = useHaptic();

    // Analytics
    useWatchTime(post.id, isActive);

    // Interaction State
    const [liked, setLiked] = useState(post.userHasLiked || false);
    const [likeCount, setLikeCount] = useState(post._count?.interactions || 0);
    const [showComments, setShowComments] = useState(false);
    const [showProperty, setShowProperty] = useState(false);
    const [isCleanMode, setIsCleanMode] = useState(false);

    // Gestures
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const bind = useDrag(({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], cancel, last }) => {
        // Pull Down to Close Modal
        if (my > 100 && dy > 0 && Math.abs(mx) < 50) {
            haptic("medium");
            router.back();
            cancel();
        }
        // Swipe Right to Profile
        if (mx > 100 && dx > 0 && Math.abs(my) < 50) {
            haptic("selection");
            router.push(`/profile/${post.author?.id}`);
            cancel();
        }
    }, {
        filterTaps: true,
        rubberband: true
    });

    const startLongPress = () => {
        longPressTimer.current = setTimeout(() => {
            haptic("light");
            setIsCleanMode(true);
        }, 500); // 500ms threshold
    };

    const endLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setIsCleanMode(false);
    };

    // Manual merge of drag bindings + long press logic
    const bindings = bind();

    const handleLike = async () => {
        if (!session?.user?.id) return;

        // Optimistic Update
        const newVal = !liked;
        setLiked(newVal);
        setLikeCount((prev: number) => newVal ? prev + 1 : prev - 1);
        if (newVal) haptic("success");

        try {
            await toggleReaction(post.id, session.user.id, "POST", "REACTION", "LIKE");
        } catch (error) {
            // Rollback
            setLiked(!newVal);
            setLikeCount((prev: number) => !newVal ? prev + 1 : prev - 1);
        }
    };

    const handleOpenComments = () => {
        haptic("light");
        setShowComments(true);
    };

    const handleOpenProperty = () => {
        haptic("medium");
        setShowProperty(true);
    };

    return (
        <div
            {...bindings}
            onPointerDown={(e) => {
                bindings.onPointerDown?.(e);
                startLongPress();
            }}
            onPointerUp={(e) => {
                bindings.onPointerUp?.(e);
                endLongPress();
            }}
            onPointerCancel={(e) => {
                bindings.onPointerCancel?.(e); // Safety
                endLongPress();
            }}
            onPointerLeave={(e) => {
                // Safety: if dragging out
                endLongPress();
            }}
            className="w-full h-full relative bg-zinc-900 border-x border-zinc-800 md:border-none touch-pan-y select-none"
        >
            <SmartVideoPlayer
                src={post.video?.url || (post.image || "")}
                aspectRatio="vertical"
                className="w-full h-full"
                isPlayingProp={isActive}
                onDoubleTap={handleLike}
            />

            {/* UI Layer (Hidden in Clean Mode) */}
            <div className={cn("absolute inset-0 transition-opacity duration-200 pointer-events-none", isCleanMode ? "opacity-0" : "opacity-100")}>
                <ReelOverlay
                    post={post}
                    isActive={isActive}
                    liked={liked}
                    likeCount={likeCount}
                    onLike={handleLike}
                    onComment={handleOpenComments}
                    onOpenProperty={handleOpenProperty}
                />
            </div>

            {/* Auto Captions */}
            {!isCleanMode && (
                <AutoCaptions text={post.content} isActive={isActive} />
            )}

            {/* Sheets */}
            {isActive && (
                <>
                    <CommentsSheet
                        postId={post.id}
                        isOpen={showComments}
                        onClose={() => setShowComments(false)}
                    />
                    <PropertySheet
                        metadata={post.metadata}
                        isOpen={showProperty}
                        onClose={() => setShowProperty(false)}
                    />
                </>
            )}
        </div>
    );
}

