import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CommunityCardSkeleton() {
    return (
        <Card className="overflow-hidden h-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            {/* Cover Image Skeleton */}
            <div className="h-32 bg-zinc-100 dark:bg-zinc-800 relative">
                <Skeleton className="h-full w-full" />
            </div>

            <div className="p-5">
                {/* Header: Avatar + Meta */}
                <div className="flex justify-between items-start mb-4">
                    <div className="relative -mt-10">
                        <Skeleton className="h-16 w-16 rounded-2xl border-4 border-white dark:border-zinc-900" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
            </div>
        </Card>
    );
}

export function CommunityListSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
    );
}
