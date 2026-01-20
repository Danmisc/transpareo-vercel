"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonReel() {
    return (
        <div className="w-full h-full relative bg-zinc-900 flex flex-col justify-end p-4 pb-20">
            {/* Gradient Mock */}
            <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 to-transparent z-0" />

            {/* Left Info */}
            <div className="flex flex-col gap-3 z-10 w-[70%]">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
                    <Skeleton className="h-4 w-32 bg-white/20" />
                </div>
                <Skeleton className="h-4 w-full bg-white/20" />
                <Skeleton className="h-4 w-[80%] bg-white/20" />
                <Skeleton className="h-6 w-40 rounded-full bg-white/20" />
            </div>

            {/* Right Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-6 z-10 items-center">
                <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
                <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
                <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
                <Skeleton className="h-9 w-9 rounded border-2 border-white/20 bg-white/10" />
            </div>
        </div>
    );
}

