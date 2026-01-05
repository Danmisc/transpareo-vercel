"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toggleReaction } from "@/lib/actions";
import { cn } from "@/lib/utils";

const REACTIONS = [
    { label: "Like", emoji: "👍", color: "bg-blue-100" },
    { label: "Love", emoji: "❤️", color: "bg-red-100" },
    { label: "Haha", emoji: "😂", color: "bg-yellow-100" },
    { label: "Wow", emoji: "😮", color: "bg-orange-100" },
    { label: "Sad", emoji: "😢", color: "bg-blue-50" },
    { label: "Angry", emoji: "😠", color: "bg-red-50" },
];

interface ReactionPickerProps {
    targetId: string;
    targetType?: "POST" | "COMMENT";
    activeReaction?: string;
    count: number;
    currentUserId?: string;
}

export function ReactionPicker({ targetId, targetType = "POST", activeReaction: initialReaction, count: initialCount, currentUserId }: ReactionPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reaction, setReaction] = useState<string | undefined>(initialReaction);
    const [count, setCount] = useState(initialCount);
    const [isPending, startTransition] = useTransition();

    const handleReact = async (emoji: string) => {
        if (!currentUserId) return; // Prompt login in real app

        const isRemoving = reaction === emoji;
        const newReaction = isRemoving ? undefined : emoji;

        // Optimistic UI
        setReaction(newReaction);
        setCount(prev => isRemoving ? prev - 1 : (reaction ? prev : prev + 1));
        setIsOpen(false);

        startTransition(async () => {
            const res = await toggleReaction(targetId, currentUserId, targetType, "REACTION", emoji);
            if (!res.success) {
                // Revert on failure
                setReaction(initialReaction);
                setCount(initialCount);
            }
        });
    };

    // Determine button appearance
    const isLiked = !!reaction;
    const activeEmoji = reaction;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                    className="inline-block"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-2 h-8 px-2 relative z-10 transition-colors",
                            isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                        onClick={() => handleReact("👍")} // Default click action
                    >
                        {isLiked && activeEmoji && activeEmoji !== "👍" ? (
                            <span className="text-lg leading-none">{activeEmoji}</span>
                        ) : (
                            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                        )}

                        <span className="text-xs font-medium">
                            {count > 0 ? count : "J'aime"}
                        </span>
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="start"
                className="p-1 flex gap-1 rounded-full w-auto shadow-xl border-none ring-1 ring-black/5 bg-white/95 backdrop-blur-sm -mb-2"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                {REACTIONS.map((r) => (
                    <motion.button
                        key={r.label}
                        whileHover={{ scale: 1.2, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReact(r.emoji);
                        }}
                        className={cn(
                            "p-2 rounded-full hover:bg-gray-100 transition-colors text-xl leading-none",
                            r.color,
                            reaction === r.emoji && "ring-2 ring-primary ring-offset-1"
                        )}
                        title={r.label}
                    >
                        {r.emoji}
                    </motion.button>
                ))}
            </PopoverContent>
        </Popover>
    );
}
