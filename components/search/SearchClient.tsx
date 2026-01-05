"use client";

import { useSearchParams, useRouter } from "next/navigation"; // Added router
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer"; // Use existing or raw if not installed, assuming installed since FeedList uses it
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MessageSquare, Users, MapPin, Zap, Building, Sparkles } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/feed/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RadarView } from "./RadarView";
import { TalentGraph } from "./TalentGraph";
import { SmartPropertyCard } from "@/components/feed/SmartPropertyCard";
import { FeedDiscoveryWidget } from "@/components/feed/FeedDiscoveryWidget";


import { SearchHistoryService, RecentSearchItem, RecentProfileItem } from "./SearchHistoryService";
import { Clock, History, Trash2, X, Search } from "lucide-react";

// ... inside SearchClient

export function SearchClient() {
    return (
        <Suspense fallback={<SearchSkeleton />}>
            <SearchLogic />
        </Suspense>
    );
}

function SearchLogic() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL State
    const query = searchParams.get("q") || "";
    const tab = searchParams.get("tab") || "all";
    const role = searchParams.get("role");
    const location = searchParams.get("location");

    const [results, setResults] = useState<any>({ users: [], posts: [], communities: [], listings: [] });
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Reset pagination when query or filters change
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        // We will fetch page 1 via the main fetch effect
    }, [query, tab, role, location, searchParams]); // Reset on any filter change

    useEffect(() => {
        if (!query && Object.keys(Object.fromEntries(searchParams)).length === 0) {
            setResults({ users: [], posts: [], communities: [], listings: [] });
            return;
        }

        const fetchResults = async () => {
            // If page 1, global loading. If page > 1, background loading
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                const params = new URLSearchParams();
                params.set("q", query);
                params.set("type", tab === "all" ? "all" : tab);
                params.set("page", page.toString()); // Pass page

                // Maps all other known filters from the current URL to the API call
                const filters = [
                    "role", "location", "verified",
                    "minPrice", "maxPrice",
                    "company", "school", "industry",
                    "minSurface", "maxSurface", "amenities",
                    "availability", "category",
                    "date", "contentType"
                ];

                filters.forEach(key => {
                    const val = searchParams.get(key);
                    if (val) params.set(key, val);
                });

                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();

                if (page === 1) {
                    setResults(data);
                    // Heuristic: if less than 10 items, no more pages
                    // Check specifically for the current tab type, but since API returns all arrays...
                    // For "posts" tab
                    if (tab === 'posts') setHasMore(data.posts.length >= 10);
                    else setHasMore(false); // Only infinite scroll posts for now as requested
                } else {
                    // Append mode (currently mainly logic for Posts)
                    // Append mode with deduplication
                    setResults((prev: any) => {
                        const existingIds = new Set(prev.posts.map((p: any) => p.id));
                        const uniqueNewPosts = data.posts.filter((p: any) => !existingIds.has(p.id));

                        // If we got posts from server but they are all duplicates, it stands to reason we reached the end 
                        // (or something is wrong with pagination, but stopping is safer than infinite loop)
                        if (uniqueNewPosts.length === 0 && data.posts.length > 0) {
                            setHasMore(false);
                        }

                        // Also standard check
                        if (data.posts.length < 10) setHasMore(false);

                        return {
                            ...prev,
                            posts: [...prev.posts, ...uniqueNewPosts]
                        };
                    });
                }

            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };

        fetchResults();
    }, [searchParams, page]); // Depend on page too

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", val);
        router.push(`/search?${params.toString()}`, { scroll: false });
    };

    // --- NO QUERY: SHOW DASHBOARD ---
    if (!query) {
        return <SearchDashboard />;
    }

    // --- EMPTY STATE ---
    const isEmpty = !loading &&
        (!results.users?.length && !results.posts?.length && !results.communities?.length && !results.listings?.length);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                    Résultats pour "{query}"
                </h1>
            </div>

            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="mb-8 w-full justify-start overflow-x-auto scrollbar-hide bg-transparent p-0 border-b rounded-none h-auto gap-4">
                    {["all", "users", "posts", "communities", "marketplace"].map(t => (
                        <TabsTrigger
                            key={t}
                            value={t}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none px-4 py-2 capitalize"
                        >
                            {t === "all" ? "Tout" : t === "users" ? "Personnes" : t === "posts" ? "Posts" : t === "communities" ? "Communautés" : t}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* --- ALL TAB --- */}
                <TabsContent value="all" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading ? <SearchSkeleton /> : isEmpty ? (
                        <NoResults query={query} />
                    ) : (
                        <>
                            <Section title="Personnes" icon={<User className="h-5 w-5" />} count={results.users?.length}>
                                <UserGrid users={results.users} />
                            </Section>
                            <Section title="Communautés" icon={<Users className="h-5 w-5" />} count={results.communities?.length}>
                                <CommunityGrid communities={results.communities} />
                            </Section>
                            <Section title="Publications" icon={<MessageSquare className="h-5 w-5" />} count={results.posts?.length}>
                                <PostList posts={results.posts} />
                            </Section>
                            <Section title="Immobilier" icon={<Building className="h-5 w-5" />} count={results.listings?.length}>
                                <MarketplaceGrid listings={results.listings} />
                            </Section>
                        </>
                    )}
                </TabsContent>

                {/* --- USERS TAB --- */}
                <TabsContent value="users">
                    {loading ? <SearchSkeleton /> : (
                        results.users?.length ? <UserGrid users={results.users} /> : <NoResults query={query} message="Aucun utilisateur trouvé." />
                    )}
                </TabsContent>

                <TabsContent value="posts">
                    {loading && page === 1 ? <SearchSkeleton /> : (
                        results.posts?.length ? (
                            <>
                                <PostList posts={results.posts} />
                                {hasMore ? (
                                    <div
                                        className="py-8 flex justify-center"
                                        ref={(node) => {
                                            if (!node || loadingMore || !hasMore) return;
                                            const observer = new IntersectionObserver((entries) => {
                                                if (entries[0].isIntersecting) {
                                                    setPage(p => p + 1);
                                                }
                                            });
                                            observer.observe(node);
                                        }}
                                    >
                                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-zinc-50 dark:bg-black px-2 text-muted-foreground">
                                                    Vous êtes à jour
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold mb-4 text-center">Suggestions pour vous</h3>
                                            <FeedDiscoveryWidget />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : <NoResults query={query} message="Aucune publication trouvée." />
                    )}
                </TabsContent>

                <TabsContent value="communities">
                    {loading ? <SearchSkeleton /> : (
                        results.communities?.length ? <CommunityGrid communities={results.communities} /> : <NoResults query={query} message="Aucune communauté trouvée." />
                    )}
                </TabsContent>

                <TabsContent value="marketplace">
                    {loading ? <SearchSkeleton /> : (
                        results.listings?.length ? <MarketplaceGrid listings={results.listings} /> : <NoResults query={query} message="Aucune annonce trouvée." />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// --- NEW COMPONENTS ---

function SearchDashboard() {
    const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
    const [recentViews, setRecentViews] = useState<RecentProfileItem[]>([]);
    const router = useRouter();

    const loadHistory = () => {
        setRecentSearches(SearchHistoryService.getRecentSearches());
        setRecentViews(SearchHistoryService.getRecentViews());
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const hasHistory = recentSearches.length > 0 || recentViews.length > 0;

    if (!hasHistory) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h2 className="text-xl font-semibold">Commencez à explorer</h2>
                <p className="text-muted-foreground max-w-sm">
                    Recherchez des personnes, des entreprises ou des annonces immobilières.
                </p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            {recentViews.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold mb-4">Consultés récemment</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {recentViews.map(user => (
                            <Link href={`/profile/${user.id}`} key={user.id}>
                                <div className="flex flex-col items-center p-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group text-center h-full">
                                    <Avatar className="h-16 w-16 mb-3 border-2 border-transparent group-hover:border-primary transition-all">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm line-clamp-1 break-all px-1">{user.name}</span>
                                    {user.role && <span className="text-xs text-muted-foreground line-clamp-1">{user.role}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {recentSearches.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recherches récentes</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-red-500 text-xs h-7 px-2"
                            onClick={() => {
                                SearchHistoryService.clearAll();
                                loadHistory();
                            }}
                        >
                            Tout effacer
                        </Button>
                    </div>
                    <div className="space-y-1">
                        {recentSearches.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md group transition-colors">
                                <Link href={`/search?q=${encodeURIComponent(item.term)}`} className="flex items-center gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-sm">{item.term}</span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"
                                    onClick={() => {
                                        SearchHistoryService.removeSearch(item.id);
                                        loadHistory();
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function NoResults({ query, message }: { query: string, message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">
                {message || `Aucun résultat pour "${query}"`}
            </h2>
            <p className="text-muted-foreground max-w-sm">
                Essayez de vérifier l'orthographe ou d'utiliser des termes plus généraux.
            </p>
        </div>
    );
}

// ... existing Section, UserGrid, PostList, MarketplaceGrid ...
function Section({ title, icon, count, children }: any) {
    if (!count) return null;
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">{icon}</div>
                <h2 className="font-bold text-xl">{title}</h2>
                <Badge variant="secondary" className="ml-auto rounded-full px-3">{count}</Badge>
            </div>
            {children}
        </div>
    );
}
// Keeping other components unchanged: UserGrid, UserCard, CommunityGrid, MarketplaceGrid, PostList, SearchSkeleton 


function UserGrid({ users }: any) {
    if (!users?.length) return <p className="text-muted-foreground italic">Aucun utilisateur.</p>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user: any) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
}


function UserCard({ user }: { user: any }) {
    const [showGraph, setShowGraph] = useState(false);

    return (
        <div className="relative">
            <Link href={`/profile/${user.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer border-zinc-200 dark:border-zinc-800 group h-full">
                    <CardContent className="flex items-start gap-4 p-4">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-zinc-900 shadow-sm">
                            <AvatarImage src={user.avatar || "/avatars/default.svg"} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="font-bold truncate">{user.name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-zinc-300 dark:border-zinc-700">
                                    {user.role}
                                </Badge>
                                {user.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {user.city}</span>}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{user.bio || "Aucune bio."}</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <div className="absolute top-4 right-4 flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/50 hover:bg-white dark:bg-black/50 dark:hover:bg-black border shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowGraph(!showGraph);
                    }}
                    title="Voir le réseau"
                >
                    <Users className="h-4 w-4 text-emerald-600" />
                </Button>
            </div>

            {showGraph && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <TalentGraph />
                </div>
            )}
        </div>
    )
}

function CommunityGrid({ communities }: any) {
    if (!communities?.length) return <p className="text-muted-foreground italic">Aucune communauté.</p>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((comm: any) => (
                <Card key={comm.id} className="hover:shadow-md transition-all cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800">
                    <div className="h-16 bg-muted relative">
                        {comm.image && <img src={comm.image} className="w-full h-full object-cover opacity-50" />}
                    </div>
                    <CardContent className="p-4 pt-8 relative">
                        <div className="absolute -top-6 left-4 h-12 w-12 rounded-xl bg-white dark:bg-black shadow-sm flex items-center justify-center border">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold">{comm.name}</p>
                            <p className="text-xs text-muted-foreground">{comm._count.members} membres</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function MarketplaceGrid({ listings }: any) {
    if (!listings?.length) return <p className="text-muted-foreground italic">Aucune annonce.</p>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item: any) => (
                <SmartPropertyCard
                    key={item.id}
                    price={item.price?.toString() || "0"}
                    location={item.address || "Localisation inconnue"}
                    surface={item.surface?.toString() || "0"}
                    rooms={item.rooms?.toString() || "0"}
                    image={item.images?.[0]?.url || undefined}
                    coords={item.latitude && item.longitude ? [item.latitude, item.longitude] : undefined}
                />
            ))}
        </div>
    );
}

function PostList({ posts }: any) {
    if (!posts?.length) return <p className="text-muted-foreground italic">Aucune publication.</p>;
    return (
        <div className="space-y-6 max-w-2xl">
            {posts.map((post: any) => (
                <PostCard
                    key={post.id}
                    id={post.id}
                    authorId={post.authorId}
                    currentUser={{ id: "viewer", role: "USER" } as any}
                    author={{
                        name: post.author.name || "Utilisateur",
                        role: post.author.role || "USER",
                        avatar: post.author.avatar || "/avatars/01.png",
                        badge: null
                    }}
                    published={new Date(post.createdAt).toLocaleDateString()}
                    content={post.content}
                    image={post.image || undefined}
                    rankingScore={0}
                    type={post.type}
                    metadata={post.metadata ? JSON.parse(post.metadata) : undefined}
                    initialComments={[]}
                    userInteraction={null}
                    metrics={{
                        likes: post.likeCount,
                        comments: post._count.comments,
                        shares: 0
                    }}
                />
            ))}
        </div>
    );
}

function SearchSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
        </div>
    );
}
