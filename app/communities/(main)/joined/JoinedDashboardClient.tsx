"use client";

import { useState } from "react";
import { JoinedCommunityCard } from "@/components/community/JoinedCommunityCard";
import { JoinedCommunitiesFilter } from "@/components/community/JoinedCommunitiesFilter";
import { Star, Shield } from "lucide-react";

interface JoinedDashboardClientProps {
    communities: any[];
}

export function JoinedDashboardClient({ communities }: JoinedDashboardClientProps) {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("recent");

    // Filter Logic
    const filtered = communities.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Sort Logic
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "members") return (b._count?.members || 0) - (a._count?.members || 0);
        // Default recent: use 'lastActive' mock
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    });

    // Categorization
    const adminCommunities = sorted.filter(c => c.role === "ADMIN" || c.role === "MODERATOR");
    const pinnedCommunities = sorted.filter(c => c.isPinned);
    const regularCommunities = sorted.filter(c => !c.role?.match(/ADMIN|MODERATOR/) && !c.isPinned);

    // If searching, squash categories to show flat list or keep categories?
    // Keeping categories is better context.

    // However, if searching, maybe user just wants to find ONE.
    const isSearching = search.length > 0;

    return (
        <div>
            <JoinedCommunitiesFilter
                search={search} onSearchChange={setSearch}
                sortBy={sortBy} onSortChange={setSortBy}
            />

            <div className="space-y-10">
                {/* 1. Admin / Managed */}
                {adminCommunities.length > 0 && (
                    <section>
                        <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
                            <Shield size={14} className="text-indigo-500" />
                            Gérées par vous
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                            {adminCommunities.map(c => (
                                <JoinedCommunityCard key={c.id} community={c} role={c.role} isPinned={c.isPinned} hasUnread={c.hasUnread} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. Pinned / Favorites */}
                {pinnedCommunities.length > 0 && !isSearching && (
                    <section>
                        <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
                            <Star size={14} className="text-orange-500" />
                            Épinglées
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                            {pinnedCommunities.map(c => (
                                <JoinedCommunityCard key={c.id} community={c} role={c.role} isPinned={c.isPinned} hasUnread={c.hasUnread} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. All Memberships */}
                <section>
                    {!isSearching && (
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
                            Adhésions ({regularCommunities.length})
                        </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                        {isSearching ? (
                            sorted.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-zinc-400 italic">
                                    Aucun résultat trouvé pour "{search}".
                                </div>
                            ) : (
                                // Show flat list if searching? Or just filtered buckets.
                                // Let's simplify: if searching, we still show buckets if matched, but "regular" usually captures most.
                                // Actually, if searching, 'sorted' contains ALL matches.
                                // It's better to show 'sorted' flat list if searching to avoid fragmentation.
                                sorted.map(c => (
                                    <JoinedCommunityCard key={c.id} community={c} role={c.role} isPinned={c.isPinned} hasUnread={c.hasUnread} />
                                ))
                            )
                        ) : (
                            regularCommunities.map(c => (
                                <JoinedCommunityCard key={c.id} community={c} role={c.role} isPinned={c.isPinned} hasUnread={c.hasUnread} />
                            ))
                        )}

                        {!isSearching && regularCommunities.length === 0 && adminCommunities.length === 0 && pinnedCommunities.length === 0 && (
                            <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-500 mb-4">Vous n'avez rejoint aucune communauté pour le moment.</p>
                                <Button>Explorer les communautés</Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
