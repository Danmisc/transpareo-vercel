"use client";

import { useState } from "react";
import { Languages, User, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProfileAboutProps {
    bio?: string;
    languages?: string; // Comma separated
}

const BIO_MAX_LENGTH = 280; // Approximate tweet length as visual threshold

export function ProfileAbout({
    bio,
    languages
}: ProfileAboutProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Process Languages
    const languageList = languages?.split(',').map(l => l.trim()).filter(Boolean) || [];
    const hasLanguages = languageList.length > 0;

    // Process Bio
    const bioText = bio || "";
    // Ensure we check actual text length and properly handle strings
    const isLongBio = bioText.length > BIO_MAX_LENGTH;
    const displayedBio = isExpanded ? bioText : (isLongBio ? bioText.slice(0, BIO_MAX_LENGTH) + "..." : bioText);

    return (
        <section className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden mb-6 p-6 md:p-8">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-500/10 text-orange-600">
                    <User className="w-4 h-4" />
                </div>
                À propos
            </h3>

            <div className="prose prose-sm dark:prose-invert max-w-none">
                {bioText ? (
                    <div className="relative">
                        <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words leading-relaxed text-[15px] font-normal text-left">
                            {displayedBio}
                        </p>
                        {isLongBio && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-0 h-auto font-semibold text-orange-600 mt-2 hover:no-underline"
                            >
                                {isExpanded ? (
                                    <span className="flex items-center hover:underline">Voir moins <ChevronUp className="w-3 h-3 ml-1" /></span>
                                ) : (
                                    <span className="flex items-center hover:underline">Voir plus <ChevronDown className="w-3 h-3 ml-1" /></span>
                                )}
                            </Button>
                        )}
                    </div>
                ) : (
                    <p className="text-muted-foreground/60 italic text-sm">
                        Aucune présentation renseignée pour le moment.
                    </p>
                )}
            </div>

            {hasLanguages && (
                <div className="mt-6 pt-6 border-t border-border/40 flex items-start sm:items-center gap-3 flex-col sm:flex-row">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-fit">
                        <Languages className="w-4 h-4" />
                        <span className="text-sm font-medium">Langues parlées :</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {languageList.map((lang, i) => (
                            <Badge key={i} variant="secondary" className="font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700">
                                {lang}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
