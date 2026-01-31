"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Compass, Sparkles, Filter, MapPin, Hash, X, ArrowRight, Plus, LayoutGrid, List as ListIcon, Map as MapIcon, ChevronDown, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityCard } from "./CommunityCard";
import { CommunityListView } from "./CommunityListView";
import { FeaturedCommunityCarousel } from "./FeaturedCommunityCarousel";
import { CommunityCardSkeleton, CommunityListSkeleton } from "./CommunitySkeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = [
    { id: "all", label: "Tout", icon: Compass },
    { id: "immobilier", label: "Immobilier", icon: Hash },
    { id: "quartier", label: "Vie de quartier", icon: MapPin },
    { id: "entraide", label: "Entraide", icon: Sparkles },
    { id: "loisirs", label: "Loisirs", icon: Hash },
    { id: "tech", label: "Tech", icon: Hash },
    { id: "business", label: "Business", icon: Hash },
];

type ViewMode = 'grid' | 'list' | 'map';
type SortOption = 'recommended' | 'popular' | 'newest';

export function CommunityDiscovery({ initialCommunities }: { initialCommunities: any[] }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // View & Sort State
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('recommended');

    // Simulate loading on filter change for SaaS feel
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [search, category, sortBy, viewMode]);

    // Filter logic
    const filteredCommunities = initialCommunities.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" ||
            (c.category?.toLowerCase() === category) ||
            (category === "immobilier" && !c.category);
        return matchesSearch && matchesCategory;
    });

    // Sort Logic
    const sortedCommunities = [...filteredCommunities].sort((a, b) => {
        if (sortBy === 'popular') return (b._count?.members || 0) - (a._count?.members || 0);
        return 0;
    });

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
    };

    // Helper to inject CTA in grid/list
    const renderCommunityContent = () => {
        // Loading State
        if (isLoading) {
            const Skeletons = Array(8).fill(0);
            if (viewMode === 'list') {
                return (
                    <div className="flex flex-col gap-3">
                        {Skeletons.map((_, i) => <CommunityListSkeleton key={i} />)}
                    </div>
                );
            }
            if (viewMode === 'map') {
                return <div className="col-span-full h-[600px] bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl animate-pulse" />;
            }
            // Grid
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Skeletons.map((_, i) => <CommunityCardSkeleton key={i} />)}
                </div>
            );
        }

        // Map View
        if (viewMode === 'map') {
            return <MapViewPlaceholder />;
        }

        // Empty State
        if ((search || category !== 'all') && sortedCommunities.length === 0) {
            return <EmptyState onReset={() => { setSearch(""); setCategory("all"); }} />;
        }

        const items = [];
        const insertionIndex = 5;
        const CardComponent = viewMode === 'list' ? CommunityListView : CommunityCard;

        for (let i = 0; i < sortedCommunities.length; i++) {
            // Inject CTA only in Grid mode
            if (i === insertionIndex && viewMode === 'grid') {
                items.push(<CreateCommunityCTA key="cta-card" />);
            }
            items.push(<CardComponent key={sortedCommunities[i].id} community={sortedCommunities[i]} index={i} />);
        }

        // Append CTA if small list (Grid only)
        if (sortedCommunities.length <= insertionIndex && viewMode === 'grid') {
            items.push(<CreateCommunityCTA key="cta-card-end" />);
        }

        // Wrapper based on view mode
        if (viewMode === 'list') {
            return <div className="flex flex-col gap-3">{items}</div>;
        }

        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{items}</div>;
    };

    return (
        <div className="min-h-full pb-20 bg-background/50">

            {/* Featured Carousel - Moved Here */}
            {!search && category === 'all' && viewMode === 'grid' && !isLoading && (
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
                    <FeaturedCommunityCarousel communities={initialCommunities} />
                </div>
            )}

            {/* HER0 / SEARCH SECTION */}
            <div className="pt-6 pb-6 px-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/50">
                <div className="max-w-5xl mx-auto">

                    <motion.div
                        initial={false}
                        animate={isSearchFocused ? { maxWidth: "100%" } : { maxWidth: "100%" }}
                        className={cn(
                            "relative mx-auto transition-all duration-500 ease-out z-50",
                            isSearchFocused ? "max-w-4xl" : "max-w-2xl"
                        )}
                    >
                        {/* Orange Glow on Focus */}
                        <div className={cn(
                            "absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl opacity-0 transition duration-500 blur-md",
                            isSearchFocused && "opacity-40"
                        )} />

                        <div className={cn(
                            "relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm border border-zinc-200 dark:border-zinc-800",
                            isSearchFocused ? "shadow-xl ring-1 ring-orange-500/20" : "hover:shadow-md"
                        )}>
                            <div className="flex items-center h-16 px-4">
                                <Search className={cn(
                                    "w-5 h-5 transition-colors duration-300 mr-4",
                                    isSearchFocused ? "text-orange-500" : "text-zinc-400"
                                )} />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => {
                                        setTimeout(() => setIsSearchFocused(false), 200);
                                    }}
                                    placeholder="Rechercher des communautés, sujets, tags..."
                                    className="flex-1 h-full bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                />

                                <div className="flex items-center gap-2">
                                    {search && (
                                        <button
                                            onClick={() => setSearch("")}
                                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <Button
                                        size="sm"
                                        className={cn(
                                            "transition-all duration-300 rounded-xl font-semibold",
                                            isSearchFocused
                                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 px-6 ml-2"
                                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-4"
                                        )}
                                    >
                                        Rechercher
                                    </Button>
                                </div>
                            </div>

                            {/* Expanded Area */}
                            <AnimatePresence>
                                {isSearchFocused && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                                    >
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Recent Searches */}
                                            <div>
                                                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                                                    <Clock size={12} /> Récent
                                                </h4>
                                                <ul className="space-y-1">
                                                    {["Colocation Paris", "Investissement Locatif", "Running Club"].map((term, i) => (
                                                        <li key={i}>
                                                            <button
                                                                onClick={() => setSearch(term)}
                                                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center justify-between group"
                                                            >
                                                                <span>{term}</span>
                                                                <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Trending */}
                                            <div>
                                                <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                                                    <TrendingUp size={12} /> Tendances
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {["Startup", "Crypto", "Paris 11", "Yoga", "Freelance"].map(tag => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            onClick={() => setSearch(tag)}
                                                            className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
                                                        >
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-6 mb-3">Catégories</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {CATEGORIES.slice(1, 4).map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => handleCategoryChange(cat.id)}
                                                            className="text-xs font-medium px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                                                        >
                                                            {cat.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">



                {/* Toolbar & Filters */}
                <div className="flex flex-col gap-6 mb-8">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                {search ? "Résultats de recherche" : viewMode === 'map' ? "Carte des communautés" : "Explorer les communautés"}
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                {search
                                    ? `${sortedCommunities.length} résultats pour "${search}"`
                                    : viewMode === 'map'
                                        ? "Explorer géographiquement"
                                        : `${sortedCommunities.length} communautés actives`
                                }
                            </p>
                        </div>

                        {/* View Toggles & Sort */}
                        <div className="flex items-center gap-2 self-start md:self-auto">
                            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg flex items-center gap-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        viewMode === 'grid'
                                            ? "bg-white dark:bg-zinc-700 text-orange-600 shadow-sm"
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    )}
                                    title="Vue Grille"
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        viewMode === 'list'
                                            ? "bg-white dark:bg-zinc-700 text-orange-600 shadow-sm"
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    )}
                                    title="Vue Liste"
                                >
                                    <ListIcon size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={cn(
                                        "p-2 rounded-md transition-all",
                                        viewMode === 'map'
                                            ? "bg-white dark:bg-zinc-700 text-orange-600 shadow-sm"
                                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    )}
                                    title="Carte"
                                >
                                    <MapIcon size={18} />
                                </button>
                            </div>

                            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        Tri: <span className="text-zinc-900 dark:text-zinc-200 font-medium">
                                            {sortBy === 'recommended' && "Recommandé"}
                                            {sortBy === 'popular' && "Populaire"}
                                            {sortBy === 'newest' && "Récent"}
                                        </span>
                                        <ChevronDown size={14} className="opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px]">
                                    <DropdownMenuItem onClick={() => setSortBy('recommended')}>Recommandé</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('popular')}>Les plus populaires</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('newest')}>Les plus récents</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Topic Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-orange-500 transition-colors"
                        >
                            <Filter size={14} className="mr-2" />
                            Filtrer
                        </Button>
                        <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

                        {CATEGORIES.map((cat) => {
                            const isActive = category === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={cn(
                                        "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                                        isActive
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm scale-105"
                                            : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-600 dark:hover:text-orange-400"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* CONTENT AREA */}
                {renderCommunityContent()}
            </div>

        </div>
    );
}

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-24 text-center bg-zinc-50/50 dark:bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800"
        >
            <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search size={24} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Aucun résultat</h3>
            <p className="text-zinc-500 text-sm mb-6">
                Essayez d'ajuster vos filtres ou votre recherche.
            </p>
            <Button
                onClick={onReset}
                className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl"
            >
                Tout effacer
            </Button>
        </motion.div>
    );
}

function CreateCommunityCTA() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="h-full min-h-[300px]"
        >
            <Card className="h-full cursor-pointer overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all duration-300 group flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="text-orange-600 dark:text-orange-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Votre tribu vous attend
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-[200px]">
                    Vous ne trouvez pas ce que vous cherchez ? Créez votre propre communauté dès maintenant.
                </p>
                <Button variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-100 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20">
                    Créer une communauté
                </Button>
            </Card>
        </motion.div>
    )
}

function MapViewPlaceholder() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group"
        >
            {/* Abstract Map Pattern Background */}
            <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center grayscale" />

            {/* Animated Pins */}
            <div className="absolute top-1/3 left-1/4">
                <div className="relative">
                    <div className="w-4 h-4 bg-orange-500 rounded-full animate-ping absolute" />
                    <div className="w-4 h-4 bg-orange-500 rounded-full relative border-2 border-white shadow-lg" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full shadow-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Paris Tech</div>
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2">
                <div className="relative">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute delay-75" />
                    <div className="w-4 h-4 bg-blue-500 rounded-full relative border-2 border-white shadow-lg" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full shadow-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Lyon Sport</div>
                </div>
            </div>

            <div className="absolute bottom-1/3 right-1/3">
                <div className="relative">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-ping absolute delay-150" />
                    <div className="w-4 h-4 bg-green-500 rounded-full relative border-2 border-white shadow-lg" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full shadow-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Marseille Art</div>
                </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm p-6 text-center">
                <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl skew-y-6 transform transition-transform group-hover:skew-y-0 duration-500">
                    <MapIcon size={32} className="text-orange-500" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Vue Carte Interactive</h3>
                <p className="text-zinc-600 dark:text-zinc-300 max-w-md text-lg">
                    Bientôt, explorez les communautés autour de vous sur une carte dynamique.
                </p>
                <div className="mt-8">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-12">
                        M'avertir de la sortie
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
