"use client";

import { MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFloatingChat, ChatUser } from "./FloatingChatProvider";

interface OpenChatButtonProps {
    conversationId: string;
    user: ChatUser;
    variant?: "icon" | "button" | "link";
    className?: string;
    children?: React.ReactNode;
}

export function OpenChatButton({
    conversationId,
    user,
    variant = "button",
    className,
    children
}: OpenChatButtonProps) {
    const { openChat, isEnabled } = useFloatingChat();

    const handleClick = () => {
        if (isEnabled) {
            openChat(conversationId, user);
        } else {
            // Fallback to full page navigation
            window.location.href = `/messages/${conversationId}`;
        }
    };

    if (variant === "icon") {
        return (
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-full", className)}
                onClick={handleClick}
            >
                <MessageCircle size={16} />
            </Button>
        );
    }

    if (variant === "link") {
        return (
            <button
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 transition-colors",
                    className
                )}
            >
                {children || "Message"}
                <ChevronRight size={14} />
            </button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
            onClick={handleClick}
        >
            <MessageCircle size={14} />
            {children || "Message"}
        </Button>
    );
}

// Hook to use the floating chat from anywhere
export function useOpenChat() {
    const { openChat, isEnabled } = useFloatingChat();

    const open = (conversationId: string, user: ChatUser) => {
        if (isEnabled) {
            openChat(conversationId, user);
        } else {
            window.location.href = `/messages/${conversationId}`;
        }
    };

    return { openChat: open, isEnabled };
}

