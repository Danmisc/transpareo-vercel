import { Badge, MapPin, Lightbulb, Award, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ICONS = {
    "HelpCircle": HelpCircle,
    "MapPin": MapPin,
    "Lightbulb": Lightbulb,
    "Award": Award
};

interface MiniBadgeProps {
    badge: {
        name: string;
        icon: string; // Lucide icon name or URL
        description?: string;
    } | null;
}

export function MiniBadge({ badge }: MiniBadgeProps) {
    if (!badge) return null;

    // Resolve icon or fallback
    // @ts-ignore
    const IconComponent = ICONS[badge.icon] || Award;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center p-0.5 bg-primary/10 rounded-full text-primary cursor-help">
                        {/* If it's a known Lucide icon */}
                        <IconComponent className="h-3 w-3" />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-semibold">{badge.name}</p>
                    {badge.description && <p className="text-xs text-muted-foreground">{badge.description}</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
