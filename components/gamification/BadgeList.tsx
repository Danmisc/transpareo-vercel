import { Badge } from "@prisma/client";
import * as Icons from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeListProps {
    badges: { badge: Badge, awardedAt: Date }[];
    className?: string;
}

export function BadgeList({ badges, className }: BadgeListProps) {
    if (!badges || badges.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            <TooltipProvider>
                {badges.map(({ badge }) => {
                    // Dynamic icon loading
                    const IconComponent = (Icons as any)[badge.icon] || Icons.Award;

                    return (
                        <Tooltip key={badge.id}>
                            <TooltipTrigger asChild>
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 border border-orange-100 w-16 h-16 cursor-default hover:bg-orange-100 transition-colors">
                                    <IconComponent className="h-6 w-6 text-orange-500 mb-1" />
                                    <span className="text-[10px] font-medium text-orange-900 truncate w-full text-center">
                                        {badge.name}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-center">
                                    <p className="font-semibold">{badge.name}</p>
                                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                                    <p className="text-[10px] italic mt-1 text-orange-600">{badge.condition}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </TooltipProvider>
        </div>
    );
}
