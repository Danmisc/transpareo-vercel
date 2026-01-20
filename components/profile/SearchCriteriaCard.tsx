"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Euro, Home, ArrowRight, Activity, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileSection } from "./ProfileSection";

interface SearchCriteriaCardProps {
    isOwner: boolean;
    role: "PRO" | "USER" | "ADMIN";
    searchCriteria?: any;
    onEdit?: () => void;
}

export function SearchCriteriaCard({ isOwner, role, searchCriteria, onEdit }: SearchCriteriaCardProps) {
    // If no search criteria and not owner, don't show anything (unless Pro, which has different logic)
    if (!searchCriteria?.isActive && !isOwner && role !== "PRO") return null;

    // Mapping for display
    const typeLabel = {
        "BUY": "Achat",
        "RENT": "Location",
        "INVEST": "Investissement"
    }[searchCriteria?.type as string] || "Recherche";

    const hasCriteria = searchCriteria?.minBudget || searchCriteria?.maxBudget || searchCriteria?.minSurface || searchCriteria?.location;

    // PRO DISPLAY (Keep existing logic or adapt? existing was static)
    // For now, let's focus on the USER "Active Search" request. 
    // If PRO, we might want to keep the "Secteur d'Activité" logic but maybe that's different data?
    // The previous code had a specific block for PRO. Let's preserve it for now if it's unrelated to "Active Search".
    if (role === "PRO" && !searchCriteria?.isActive) {
        // Fallback to legacy static pro view if no active search is explicitly set? 
        // Or maybe Pros also use this for "Client Search"? 
        // Let's assume the user wants the "Active Search" for themselves primarily.
        // Given the prompt "fonctionner à fond le module Recherche active", I will replace the Pro view ONLY if they have an active search.
        // If not, I'll keep the static legacy view or hide it? 
        // The previous code had a static PRO view. I will keep it as a fallback.
        return (
            <ProfileSection title="Secteur d'Activité" noPadding>
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Zone Principale</span>
                            <div className="font-bold text-zinc-900 dark:text-white text-base mt-1">Paris & Île-de-France</div>
                            <div className="text-xs text-zinc-500 mt-1">Spécialiste 11ème, 12ème</div>
                        </div>
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Type de Biens</span>
                            <div className="font-bold text-zinc-900 dark:text-white text-base mt-1">Résidentiel & Commercial</div>
                            <div className="text-xs text-zinc-500 mt-1">Vente & Location</div>
                        </div>
                    </div>
                </div>
            </ProfileSection>
        );
    }

    return (
        <ProfileSection
            title="Recherche Active"
            noPadding
            action={isOwner && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" onClick={onEdit}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )}
        >
            <div className="p-6">
                {!searchCriteria?.isActive ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                            Aucune recherche active
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-6">
                            Partagez vos critères de recherche pour informer votre réseau et recevoir des opportunités ciblées.
                        </p>
                        {isOwner && (
                            <Button variant="outline" className="border-dashed" onClick={onEdit}>
                                Activer ma recherche
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Budget */}
                            <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Budget</span>
                                    <Euro className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                </div>
                                <div>
                                    <div className="font-bold text-zinc-900 dark:text-white text-lg truncate">
                                        {searchCriteria.minBudget ? `${searchCriteria.minBudget.toLocaleString()} - ` : ''}
                                        {searchCriteria.maxBudget ? searchCriteria.maxBudget.toLocaleString() : 'Non défini'} €
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-1 truncate">
                                        {searchCriteria.type === 'RENT' ? 'Loyer CC / mois' : 'Budget acquisition'}
                                    </div>
                                </div>
                            </div>

                            {/* Surface */}
                            <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Surface</span>
                                    <Home className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                </div>
                                <div>
                                    <div className="font-bold text-zinc-900 dark:text-white text-lg truncate">
                                        {searchCriteria.minSurface || 0} m² <span className="text-sm font-normal text-zinc-400">min</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-1 truncate">
                                        {searchCriteria.rooms ? `${searchCriteria.rooms} pièces` : 'Tout type'}
                                        {searchCriteria.assetTypes && ` • ${searchCriteria.assetTypes}`}
                                    </div>
                                </div>
                            </div>

                            {/* Sector */}
                            <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Secteur</span>
                                    <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                </div>
                                <div>
                                    <div className="font-bold text-zinc-900 dark:text-white text-lg truncate">
                                        {searchCriteria.location || "Non défini"}
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-1 truncate">
                                        Zone de recherche
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details (Optional expansion) */}
                        {searchCriteria.description && (
                            <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                                    "{searchCriteria.description}"
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </ProfileSection>
    );
}
