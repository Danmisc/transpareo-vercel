"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Search,
    Bell,
    ExternalLink,
    HelpCircle,
    LayoutDashboard,
    Users,
    ShieldAlert,
    BarChart3,
    Settings,
    CreditCard,
    UserPlus,
    FileText,
    LogOut,
    Loader2,
    File,
    MessageSquare,
    User,
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Command as CommandPrimitive } from "cmdk";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { searchCommunityDashboard, type GroupedSearchResults } from "@/lib/community-search-actions";
import { useSearchHistory } from "@/hooks/use-search-history";

interface DashboardHeaderProps {
    communityName: string;
    communitySlug: string;
}

const PAGE_NAMES: Record<string, string> = {
    "manage": "Vue d'ensemble",
    "members": "Membres",
    "moderation": "Modération",
    "settings": "Paramètres",
    "analytics": "Statistiques"
};

export function DashboardHeader({ communityName, communitySlug }: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [isSearching, setIsSearching] = React.useState(false);
    const [results, setResults] = React.useState<GroupedSearchResults | null>(null);
    const { history, addToHistory, clearHistory } = useSearchHistory();
    const commandRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Search
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                try {
                    const data = await searchCommunityDashboard(communitySlug, query);
                    setResults(data);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults(null);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, communitySlug]);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    // Extract the last segment to determine page title
    const segments = pathname.split("/");
    const lastSegment = segments[segments.length - 1];
    const pageKey = lastSegment === "manage" ? "manage" : lastSegment;
    const pageTitle = PAGE_NAMES[pageKey] || "Tableau de Bord";

    const hasResults = results && (results.pages.length > 0 || results.members.length > 0 || results.settings.length > 0 || results.posts.length > 0);

    return (
        <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50 transition-all">
            {/* Left: Breadcrumbs / Title */}
            <div className="flex items-center gap-2 text-sm min-w-[200px] flex-none">
                <span className="text-zinc-500 font-medium truncate max-w-[150px] hover:text-zinc-800 transition-colors cursor-pointer" onClick={() => router.push(`/communities/${communitySlug}/manage`)}>{communityName}</span>
                <span className="text-zinc-300">/</span>
                <span className="font-semibold text-zinc-900 dark:text-white whitespace-nowrap">{pageTitle}</span>
            </div>

            {/* Center: Inline Advanced Search */}
            <div className="flex-1 flex justify-center px-4 md:px-8 max-w-3xl mx-auto relative z-50">
                filter={undefined}
                onClick={() => {
                    if (!open) setOpen(true);
                    const input = commandRef.current?.querySelector('input');
                    if (input) input.focus();
                }}
                    >
                <div className="flex items-center px-4 w-full" cmdk-input-wrapper="">
                    {isSearching ? (
                        <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin text-indigo-500" />
                    ) : (
                        <Search className={`mr-2 h-4 w-4 shrink-0 transition-colors ${open ? "text-indigo-500" : "text-muted-foreground"}`} />
                    )}
                    <CommandPrimitive.Input
                        value={query}
                        onValueChange={(val) => {
                            setQuery(val);
                            if (!open) setOpen(true);
                        }}
                        placeholder="Rechercher partout dans le dashboard..."
                        className="h-11 w-full border-none bg-transparent focus:ring-0 text-sm outline-none placeholder:text-muted-foreground/70"
                        onFocus={() => setOpen(true)}
                    />
                </div>

                {/* Dropdown Results */}
                {open && (
                    <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 pointer-events-auto z-50">
                        <CommandList className="max-h-[400px] overflow-y-auto p-2">
                            {!query && (
                                <>
                                    {history.length > 0 && (
                                        <>
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Récents</span>
                                                <button
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                                                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                                                >
                                                    Effacer
                                                </button>
                                            </div>
                                            <CommandGroup>
                                                {history.map((item) => (
                                                    <CommandItem
                                                        key={item.id}
                                                        value={`history-${item.id}-${item.timestamp}`}
                                                        onSelect={() => runCommand(() => router.push(item.url))}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        className="group aria-selected:bg-zinc-50 dark:aria-selected:bg-zinc-900/50 cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3 w-full p-1">
                                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                                <History className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-zinc-700 dark:text-zinc-200">{item.title}</span>
                                                                <span className="text-xs text-zinc-400">Recherche récente</span>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator className="my-2" />
                                        </>
                                    )}

                                    <CommandGroup heading="Navigation Principale" className="text-zinc-500">
                                        <CommandItem
                                            value="nav-overview"
                                            onSelect={() => {
                                                addToHistory({ id: 'nav-overview', query: '', type: 'page', title: "Vue d'ensemble", url: `/communities/${communitySlug}/manage` });
                                                runCommand(() => router.push(`/communities/${communitySlug}/manage`));
                                            }}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="py-2.5 cursor-pointer"
                                        >
                                            <LayoutDashboard className="mr-2 h-4 w-4" /> Vue d'ensemble
                                        </CommandItem>
                                        <CommandItem
                                            value="nav-members"
                                            onSelect={() => {
                                                addToHistory({ id: 'nav-members', query: '', type: 'page', title: "Membres", url: `/communities/${communitySlug}/manage/members` });
                                                runCommand(() => router.push(`/communities/${communitySlug}/manage/members`));
                                            }}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="py-2.5 cursor-pointer"
                                        >
                                            <Users className="mr-2 h-4 w-4" /> Membres
                                        </CommandItem>
                                        <CommandItem
                                            value="nav-moderation"
                                            onSelect={() => {
                                                addToHistory({ id: 'nav-mod', query: '', type: 'page', title: "Modération", url: `/communities/${communitySlug}/manage/moderation` });
                                                runCommand(() => router.push(`/communities/${communitySlug}/manage/moderation`));
                                            }}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="py-2.5 cursor-pointer"
                                        >
                                            <ShieldAlert className="mr-2 h-4 w-4" /> Modération
                                        </CommandItem>
                                        <CommandItem
                                            value="nav-analytics"
                                            onSelect={() => {
                                                addToHistory({ id: 'nav-analytics', query: '', type: 'page', title: "Statistiques", url: `/communities/${communitySlug}/manage/analytics` });
                                                runCommand(() => router.push(`/communities/${communitySlug}/manage/analytics`));
                                            }}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="py-2.5 cursor-pointer"
                                        >
                                            <BarChart3 className="mr-2 h-4 w-4" /> Statistiques
                                        </CommandItem>
                                        <CommandItem
                                            value="nav-settings"
                                            onSelect={() => {
                                                addToHistory({ id: 'nav-settings', query: '', type: 'page', title: "Paramètres", url: `/communities/${communitySlug}/manage/settings` });
                                                runCommand(() => router.push(`/communities/${communitySlug}/manage/settings`));
                                            }}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="py-2.5 cursor-pointer"
                                        >
                                            <Settings className="mr-2 h-4 w-4" /> Paramètres
                                        </CommandItem>
                                    </CommandGroup>
                                    <CommandSeparator className="my-2" />
                                    <CommandGroup heading="Ressources" className="text-zinc-500">
                                        <CommandItem
                                            value="res-docs"
                                            onSelect={() => runCommand(() => window.open('/docs', '_blank'))}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="mr-2 h-4 w-4" />
                                                <span>Documentation</span>
                                            </div>
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}

                            {query && !hasResults && !isSearching && (
                                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                    Aucun résultat trouvé pour "{query}"
                                </CommandEmpty>
                            )}

                            {results && (
                                <>
                                    {results.pages.length > 0 && (
                                        <CommandGroup heading="Pages & Navigation">
                                            {results.pages.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    value={item.id}
                                                    onSelect={() => {
                                                        addToHistory({ id: item.id, query: query, type: 'page', title: item.title, url: item.url });
                                                        runCommand(() => router.push(item.url));
                                                    }}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    className="py-3 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800">
                                                            <LayoutDashboard className="h-4 w-4 text-zinc-500" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{item.title}</span>
                                                            {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}

                                    {results.members.length > 0 && (
                                        <>
                                            <CommandSeparator className="my-2" />
                                            <CommandGroup heading="Membres">
                                                {results.members.map((item) => (
                                                    <CommandItem
                                                        key={item.id}
                                                        value={item.id}
                                                        onSelect={() => {
                                                            addToHistory({ id: item.id, query: query, type: 'member', title: item.title, url: item.url });
                                                            runCommand(() => router.push(item.url));
                                                        }}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        className="py-3 cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{item.title}</span>
                                                                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {results.settings.length > 0 && (
                                        <>
                                            <CommandSeparator className="my-2" />
                                            <CommandGroup heading="Paramètres">
                                                {results.settings.map((item) => (
                                                    <CommandItem
                                                        key={item.id}
                                                        value={item.id}
                                                        onSelect={() => {
                                                            addToHistory({ id: item.id, query: query, type: 'page', title: item.title, url: item.url });
                                                            runCommand(() => router.push(item.url));
                                                        }}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        className="py-3 cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800">
                                                                <Settings className="h-4 w-4 text-zinc-500" />
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">{item.title}</span>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {results.posts.length > 0 && (
                                        <>
                                            <CommandSeparator className="my-2" />
                                            <CommandGroup heading="Publications Récentes">
                                                {results.posts.map((item) => (
                                                    <CommandItem
                                                        key={item.id}
                                                        value={item.id}
                                                        onSelect={() => {
                                                            addToHistory({ id: item.id, query: query, type: 'query', title: item.title, url: item.url });
                                                            runCommand(() => router.push(item.url));
                                                        }}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        className="py-3 cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-md bg-indigo-50 dark:bg-indigo-900/30">
                                                                <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium truncate max-w-[300px]">{item.title}</span>
                                                                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                                                            </div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}
                                </>
                            )}
                        </CommandList>
                    </div>
                )}
            </CommandPrimitive>
        </div>

                {/* Right: Actions */ }
    <div className="flex items-center gap-2 flex-none min-w-[200px] justify-end">
        {/* Utility Icons */}
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <HelpCircle className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white relative mr-2">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-black" />
        </Button>

        {/* Primary Action */}
        <Button asChild variant="default" size="sm" className="gap-2 shadow-sm hidde md:flex bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-10 px-5 text-base">
            <Link href={`/communities/${communitySlug}`} target="_blank">
                Voir la communauté
                <ExternalLink className="h-3.5 w-3.5" />
            </Link>
        </Button>
    </div>
        </header >
    );
}
