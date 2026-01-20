"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { toggleReadStatus } from "@/lib/bookmark-actions";
import { cn } from "@/lib/utils";

interface ReadStatusToggleProps {
    savedId: string;
    initialIsRead: boolean;
}

export function ReadStatusToggle({ savedId, initialIsRead }: ReadStatusToggleProps) {
    const [isRead, setIsRead] = useState(initialIsRead);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const res = await toggleReadStatus(savedId);
        if (res.success && res.newProgress !== undefined) {
            setIsRead(res.newProgress >= 1.0);
        }
        setLoading(false);
    };

    return (
        <Button
            variant={isRead ? "default" : "outline"}
            size="sm"
            className={cn("gap-2", isRead ? "bg-green-600 hover:bg-green-700" : "")}
            onClick={handleToggle}
            disabled={loading}
        >
            {isRead ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {isRead ? "Lu" : "Marquer comme lu"}
        </Button>
    );
}

