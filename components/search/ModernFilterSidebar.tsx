"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Check,
    MapPin,
    Building2,
    GraduationCap,
    Briefcase,
    RotateCcw,
    Filter,
    ShieldCheck,
    Home,
    Building,
    Key,
    Users,
    Euro
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ModernFilterSidebar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const currentTab = searchParams.get("tab") || "all";

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const resetFilters = () => {
        const params = new URLSearchParams();
        if (searchParams.get("q")) params.set("q", searchParams.get("q")!); // Keep query
        params.set("tab", currentTab); // Keep tab
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <aside className="w-full h-full flex flex-col bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-600" />
                    <h2 className="font-semibold text-sm">Filtres</h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-red-500"
                    onClick={resetFilters}
                >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Réinitialiser
                </Button>
            </div>

            <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-8">

                    {/* --- GLOBAL FILTERS --- */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Vérifié uniquement
                                </span>
                                <span className="text-xs text-muted-foreground">Profils et annonces certifiés</span>
                            </div>
                            <Switch
                                checked={searchParams.get("verified") === "true"}
                                onCheckedChange={(c) => updateFilter("verified", c ? "true" : null)}
                            />
                        </div>
                    </section>

                    <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                    {/* --- LOCATION (Smart) --- */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Localisation</h3>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Ville, région..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                                defaultValue={searchParams.get("location") || ""}
                                onBlur={(e) => updateFilter("location", e.target.value || null)}
                                onKeyDown={(e) => e.key === 'Enter' && updateFilter("location", e.currentTarget.value || null)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["Paris", "Lyon", "Marseille", "Remote"].map(city => (
                                <Badge
                                    key={city}
                                    variant={searchParams.get("location") === city ? "secondary" : "outline"}
                                    className="cursor-pointer hover:border-emerald-500 transition-colors"
                                    onClick={() => updateFilter("location", searchParams.get("location") === city ? null : city)}
                                >
                                    {city}
                                </Badge>
                            ))}
                        </div>
                    </section>

                    <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                    {/* --- DYNAMIC FILTERS --- */}

                    {/* USERS / NETWORK FILTERS */}
                    {(currentTab === "all" || currentTab === "users") && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Rôle & Statut</h3>
                                <RoleSelector
                                    current={searchParams.get("role")}
                                    onChange={(val) => updateFilter("role", val)}
                                />
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Affiliation</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors" onClick={() => { }}>
                                        <Building2 className="w-4 h-4 text-zinc-400" />
                                        <span className="text-sm">Entreprise</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors" onClick={() => { }}>
                                        <GraduationCap className="w-4 h-4 text-zinc-400" />
                                        <span className="text-sm">École / Université</span>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Disponibilité</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["En recherche", "À l'écoute", "Indisponible", "Mentor"].map(status => (
                                        <Badge
                                            key={status}
                                            variant={searchParams.get("availability") === status ? "secondary" : "outline"}
                                            className="cursor-pointer hover:border-emerald-500 transition-colors"
                                            onClick={() => updateFilter("availability", searchParams.get("availability") === status ? null : status)}
                                        >
                                            {status}
                                        </Badge>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Secteur</h3>
                                <Input
                                    placeholder="Ex: Marketing, Tech..."
                                    className="bg-zinc-50 dark:bg-zinc-900/50 h-8 text-sm"
                                    onBlur={(e) => updateFilter("industry", e.target.value || null)}
                                />
                            </section>
                        </div>
                    )}

                    {/* MARKETPLACE FILTERS */}
                    {(currentTab === "marketplace") && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Budget Mensuel</h3>
                                    <Badge variant="outline" className="font-mono">{searchParams.get("minPrice") || 500}€ - {searchParams.get("maxPrice") || 2000}€</Badge>
                                </div>
                                <PriceHistogram />
                                <Slider
                                    defaultValue={[Number(searchParams.get("minPrice") || 500), Number(searchParams.get("maxPrice") || 2000)]}
                                    max={5000}
                                    step={50}
                                    className="pt-2"
                                    onValueCommit={(val) => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("minPrice", val[0].toString());
                                        params.set("maxPrice", val[1].toString());
                                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                    }}
                                />
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Type de bien</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Appartement", "Maison", "Colocation", "Bureau"].map(type => (
                                        <div key={type} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-center text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-emerald-500 transition-all">
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Surface (m²)</h3>
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Min" className="h-8 text-sm" type="number" />
                                    <span className="text-muted-foreground">-</span>
                                    <Input placeholder="Max" className="h-8 text-sm" type="number" />
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Commodités</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Parking", "Wifi", "Meublé", "Balcon", "Ascenseur"].map(feat => (
                                        <Badge
                                            key={feat}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 hover:border-emerald-200"
                                        >
                                            {feat}
                                        </Badge>
                                    ))}
                                </div>
                            </section>

                        </div>
                    )}

                    {/* POSTS FILTERS */}
                    {(currentTab === "posts" || currentTab === "all") && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Date de publication</h3>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { label: "N'importe quand", val: null },
                                        { label: "Aujourd'hui", val: "today" },
                                        { label: "Cette semaine", val: "week" },
                                        { label: "Ce mois-ci", val: "month" }
                                    ].map(date => (
                                        <div
                                            key={date.label}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm",
                                                searchParams.get("date") === date.val
                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-medium"
                                                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                            )}
                                            onClick={() => updateFilter("date", date.val)}
                                        >
                                            <div className={cn("w-2 h-2 rounded-full", searchParams.get("date") === date.val ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700")} />
                                            {date.label}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Type de contenu</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Vidéo", "Image", "Article", "Sondage"].map(type => (
                                        <Badge
                                            key={type}
                                            variant={searchParams.get("contentType") === type ? "secondary" : "outline"}
                                            className="cursor-pointer hover:border-emerald-500 transition-colors"
                                            onClick={() => updateFilter("contentType", searchParams.get("contentType") === type ? null : type)}
                                        >
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* COMMUNITIES FILTERS */}
                    {(currentTab === "communities") && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Thématique</h3>
                                <div className="space-y-2">
                                    {["Tech & Dev", "Immobilier", "Business", "Art & Design", "Sport"].map(cat => (
                                        <div className="flex items-center space-x-2" key={cat}>
                                            <Switch
                                                checked={searchParams.get("category") === cat}
                                                onCheckedChange={(c) => updateFilter("category", c ? cat : null)}
                                            />
                                            <span className="text-sm">{cat}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}


                </div>
            </ScrollArea>
        </aside>
    );
}

// --- SUB-COMPONENTS ---

function RoleSelector({ current, onChange }: { current: string | null, onChange: (val: string | null) => void }) {
    const roles = [
        { id: "TENANT", label: "Locataire", icon: Key },
        { id: "OWNER", label: "Proprio", icon: Home },
        { id: "AGENCY", label: "Agence", icon: Building },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => {
                const isSelected = current === role.id;
                const Icon = role.icon;
                return (
                    <div
                        key={role.id}
                        onClick={() => onChange(isSelected ? null : role.id)}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all duration-200 gap-1",
                            isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-muted-foreground"
                        )}
                    >
                        <Icon className={cn("w-5 h-5", isSelected && "fill-current")} />
                        <span className="text-[10px] font-medium">{role.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

function PriceHistogram() {
    // Fake data for visual flair
    const heights = [20, 45, 30, 60, 80, 55, 40, 70, 45, 30, 20, 10];

    return (
        <div className="h-16 flex items-end justify-between gap-1 px-1 opacity-50">
            {heights.map((h, i) => (
                <div
                    key={i}
                    className="w-full bg-emerald-500/20 rounded-t-sm"
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
    )
}
