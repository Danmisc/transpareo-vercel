"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Award, Quote, Plus, ChevronDown, ChevronUp, Star, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { GiveEndorsementModal } from "./ProfileModals";

interface Endorsement {
    id: string;
    skill: string;
    message?: string | null;
    relationship?: string | null;
    createdAt: Date | string;
    giver: {
        id: string;
        name: string | null;
        avatar: string | null;
        role: string;
        headline?: string | null;
    };
}

interface EndorsementsSectionProps {
    endorsements: Endorsement[];
    isOwner: boolean;
    userId: string;
    userName?: string;
}

export function EndorsementsSection({ endorsements, isOwner, userId, userName = "cet utilisateur" }: EndorsementsSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Group endorsements by skill
    const endorsementsBySkill = endorsements.reduce((acc, e) => {
        if (!acc[e.skill]) acc[e.skill] = [];
        acc[e.skill].push(e);
        return acc;
    }, {} as Record<string, Endorsement[]>);

    const topSkills = Object.entries(endorsementsBySkill)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5);

    // Show "Be first to recommend" for visitors when empty
    if (endorsements.length === 0 && !isOwner) {
        return (
            <>
                <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                    <div className="text-center py-4">
                        <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm mb-3">Soyez le premier à recommander {userName}</p>
                        <Button onClick={() => setModalOpen(true)} size="sm" className="bg-blue-500 hover:bg-blue-600">
                            <Send className="w-4 h-4 mr-2" />
                            Recommander
                        </Button>
                    </div>
                </div>
                <GiveEndorsementModal open={modalOpen} onOpenChange={setModalOpen} receiverId={userId} receiverName={userName} />
            </>
        );
    }

    return (
        <>
            <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-lg">Recommandations</h3>
                        {endorsements.length > 0 && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                {endorsements.length}
                            </span>
                        )}
                    </div>
                    {!isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModalOpen(true)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <Send className="w-4 h-4 mr-1" />
                            Recommander
                        </Button>
                    )}
                </div>

                {endorsements.length === 0 && isOwner ? (
                    <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                        <Award className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Aucune recommandation</p>
                        <p className="text-zinc-400 text-xs mt-1">Partagez votre profil pour recevoir des recommandations</p>
                    </div>
                ) : (
                    <>
                        {/* Top Skills Summary */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {topSkills.map(([skill, endorsersList]) => (
                                <div
                                    key={skill}
                                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
                                >
                                    <Star className="w-3 h-3 text-blue-500 fill-blue-500" />
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{skill}</span>
                                    <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-800/50 px-1.5 py-0.5 rounded-full">
                                        {endorsersList.length}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Endorsement Cards */}
                        <div className="space-y-3">
                            {(expanded ? endorsements : endorsements.slice(0, 2)).map((endorsement) => (
                                <EndorsementCard key={endorsement.id} endorsement={endorsement} />
                            ))}
                        </div>

                        {endorsements.length > 2 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {expanded ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Voir moins
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Voir les {endorsements.length - 2} autres
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
            <GiveEndorsementModal open={modalOpen} onOpenChange={setModalOpen} receiverId={userId} receiverName={userName} />
        </>
    );
}

function EndorsementCard({ endorsement }: { endorsement: Endorsement }) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-3">
                <Link href={`/profile/${endorsement.giver.id}`}>
                    <Avatar className="w-10 h-10 border border-zinc-200 dark:border-zinc-600">
                        <AvatarImage src={endorsement.giver.avatar || "/avatars/default.svg"} />
                        <AvatarFallback>{endorsement.giver.name?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${endorsement.giver.id}`} className="font-semibold text-sm hover:underline">
                            {endorsement.giver.name}
                        </Link>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            {endorsement.skill}
                        </span>
                    </div>
                    {endorsement.giver.headline && (
                        <p className="text-xs text-zinc-500 truncate">{endorsement.giver.headline}</p>
                    )}
                    {endorsement.relationship && (
                        <p className="text-xs text-zinc-400 mt-0.5">{endorsement.relationship}</p>
                    )}
                </div>
            </div>

            {endorsement.message && (
                <div className="mt-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                    <Quote className="w-4 h-4 text-blue-400 mb-1" />
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                        "{endorsement.message}"
                    </p>
                </div>
            )}

            <p className="text-[10px] text-zinc-400 mt-2">
                {formatDistanceToNow(new Date(endorsement.createdAt), { addSuffix: true, locale: fr })}
            </p>
        </div>
    );
}

