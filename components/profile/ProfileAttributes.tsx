"use client";

import { Check, Users, Sparkles, Briefcase, Plus, ThumbsUp, ArrowUpRight } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { endorseSkill } from "@/lib/actions-skills";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface ProfileAttributesProps {
    isOwner: boolean;
    skills?: any[];
    onEdit?: () => void;
}

export function ProfileAttributes({ isOwner, skills = [], onEdit }: ProfileAttributesProps) {
    const router = useRouter();
    const [votingId, setVotingId] = useState<string | null>(null);

    const professionalSkills = skills.filter(s => s.category === "PROFESSIONAL");
    const personalAttributes = skills.filter(s => s.category === "PERSONAL");

    const handleEndorse = async (e: React.MouseEvent, skillId: string, skillName: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOwner) {
            toast.error("Vous ne pouvez pas vous auto-recommander");
            return;
        }

        setVotingId(skillId);
        try {
            const result = await endorseSkill(skillId);
            if (result.success) {
                toast.success(`+1 pour ${skillName}`);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Erreur technique");
        } finally {
            setVotingId(null);
        }
    };

    const SkillRow = ({ skill, type }: { skill: any, type: 'pro' | 'personal' }) => {
        const isPro = type === 'pro';
        return (
            <div className="group flex items-start justify-between py-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                    <div className="font-semibold text-[15px] flex items-center gap-2">
                        {skill.name}
                        {isPro && skill.endorsementsCount > 5 && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-zinc-100 text-zinc-500">
                                Top expertise
                            </Badge>
                        )}
                    </div>

                    {skill.endorsementsCount > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                                <span className="font-medium text-foreground">{skill.endorsementsCount}</span> recommandation{skill.endorsementsCount > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {!isOwner && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEndorse(e, skill.id, skill.name)}
                        disabled={!!votingId}
                        className={cn(
                            "opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-200 dark:border-zinc-800",
                            votingId === skill.id && "opacity-100 bg-zinc-50"
                        )}
                    >
                        <ThumbsUp className={cn("w-4 h-4 mr-2", votingId === skill.id && "text-indigo-600")} />
                        Recommander
                    </Button>
                )}
            </div>
        );
    };

    if (skills.length === 0) {
        if (!isOwner) return null;
        return (
            <ProfileSection title="Compétences">
                <div
                    onClick={onEdit}
                    className="flex flex-col items-center justify-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 cursor-pointer hover:bg-zinc-50 transition-colors"
                >
                    <Plus className="w-6 h-6 text-zinc-400 mb-2" />
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Ajouter des compétences</p>
                </div>
            </ProfileSection>
        );
    }

    return (
        <ProfileSection title="Compétences & Atouts">
            <div className="space-y-8">

                {/* PROFESSIONAL SKILLS - List Layout */}
                {professionalSkills.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Briefcase className="w-4 h-4 text-zinc-500" />
                            <h4 className="text-sm font-bold text-foreground">Expertises</h4>
                        </div>
                        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {professionalSkills.map((skill) => (
                                <SkillRow key={skill.id} skill={skill} type="pro" />
                            ))}
                        </div>
                    </div>
                )}

                {/* PERSONAL ATTRIBUTES - List Layout */}
                {personalAttributes.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-sm font-bold text-foreground">Compétences</h4>
                        </div>
                        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {personalAttributes.map((skill) => (
                                <SkillRow key={skill.id} skill={skill} type="personal" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Foot Action */}
                {isOwner && onEdit && (
                    <div className="pt-2 flex justify-center border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onEdit}
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Afficher toutes les compétences ({skills.length})
                        </Button>
                    </div>
                )}
            </div>
        </ProfileSection>
    );
}
