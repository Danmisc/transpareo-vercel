import { Skeleton } from "@/components/ui/skeleton";

export function ListingSkeleton() {
    return (
        <div className="space-y-3">
            {/* Image Carousel Section */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                {/* Skeleton for badges top-left */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <Skeleton className="h-6 w-20 rounded bg-white/60 dark:bg-black/40" />
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-2">
                {/* Title + Rating */}
                <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Address */}
                <Skeleton className="h-4 w-1/2 rounded bg-zinc-100 dark:bg-zinc-900" />

                {/* Surface */}
                <Skeleton className="h-4 w-1/3 rounded bg-zinc-100 dark:bg-zinc-900" />

                {/* Price + Date */}
                <div className="flex justify-between items-end pt-2">
                    <Skeleton className="h-6 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <Skeleton className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-900" />
                </div>
            </div>
        </div>
    )
}

