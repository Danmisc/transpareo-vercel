"use client";


import { Building2, Plus, Pencil } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Experience {
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate: Date | string;
    endDate?: Date | string | null;
    description?: string;
}

interface ProfileJourneyProps {
    isOwner: boolean;
    experiences?: Experience[];
    onEdit?: () => void;
}

export function ProfileJourney({ isOwner, experiences = [], onEdit }: ProfileJourneyProps) {
    // No local state needed for dialog anymore

    const handleEdit = (exp: Experience) => {
        if (!isOwner) return;
        onEdit?.();
    };

    const handleAdd = () => {
        onEdit?.();
    };

    const formatDate = (date: Date | string) => {
        if (!date) return "";
        return format(new Date(date), "MMM yyyy", { locale: fr });
    };

    const getDuration = (start: Date | string, end?: Date | string | null) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date();
        const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        const years = Math.floor(diffMonths / 12);
        const months = diffMonths % 12;

        let duration = "";
        if (years > 0) duration += `${years} an${years > 1 ? "s" : ""}`;
        if (months > 0) duration += ` ${months} mois`;
        return duration || "1 mois";
    };

    return (
        <ProfileSection
            title="Parcours Immobilier"
            action={isOwner && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAdd}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-900/50 dark:hover:bg-amber-950/50 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> Ajouter une expérience
                </Button>
            )}
        >
            <div className="space-y-8 mt-2">
                {experiences.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground italic bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                        Aucun parcours renseigné pour le moment.
                    </div>
                ) : (
                    experiences.map((exp, index) => (
                        <div key={exp.id} className="relative pl-2 group">
                            {/* Connector Line */}
                            {index !== experiences.length - 1 && (
                                <div className="absolute left-[34px] top-12 bottom-[-24px] w-px bg-zinc-200 dark:bg-zinc-800" />
                            )}

                            <div className="flex gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center text-zinc-500 border border-zinc-200 dark:border-zinc-700/50 shadow-sm relative z-0">
                                    <Building2 className="w-5 h-5 opacity-70" />
                                </div>
                                <div className="flex-1 pt-1 group-hover:bg-zinc-50/50 dark:group-hover:bg-zinc-900/20 p-2 -ml-2 rounded-lg transition-colors cursor-default relative">
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-all h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                            onClick={() => handleEdit(exp)}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                    )}

                                    <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-none mb-1">
                                        {exp.title}
                                    </h3>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                        {exp.company}
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Présent"}
                                        </span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                        <span className="font-medium text-orange-600/80">
                                            {getDuration(exp.startDate, exp.endDate)}
                                        </span>
                                        {exp.location && (
                                            <>
                                                <span className="w-0.5 h-0.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                                <span className="flex items-center gap-1">
                                                    {exp.location}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed whitespace-pre-wrap">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ProfileSection>
    );
}
