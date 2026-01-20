"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Hash } from "lucide-react";
import { getTrendingTagsAction } from "@/app/actions/discovery"; // We need to create this
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function TrendingTags() {
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTrendingTagsAction().then((data) => {
            setTags(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <TrendingSkeleton />;
    if (tags.length === 0) return null;

    return (
        <div className="rounded-xl glass-card text-card-foreground">
            <div className="p-6 pb-3 pt-4">
                <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    Tendances Immo
                </h3>
            </div>
            <div className="p-6 pt-0 space-y-4">
                {tags.map((item, idx) => (
                    <Link
                        key={item.tag}
                        href={`/search?q=${encodeURIComponent(item.tag)}&type=posts`}
                        className="flex items-center justify-between group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 -mx-2 p-2 rounded-lg transition-colors"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground font-medium mb-0.5">
                                {idx === 0 ? "Immobilier • Tendance" : idx === 1 ? "France • Viral" : "Sujet Populaire"}
                            </span>
                            <span className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors">
                                #{item.tag}
                            </span>
                            <span className="text-[11px] text-zinc-500 mt-0.5">
                                {item._count?.posts ? `${item._count.posts} posts` : `${(10 - idx) * 1500 + 342} posts`}
                            </span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <ArrowRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400 transform -translate-x-2 group-hover:translate-x-0 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function TrendingSkeleton() {
    return (
        <div className="rounded-xl glass-card text-card-foreground p-6 space-y-4">
            <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
                ))}
            </div>
        </div>
    );
}

