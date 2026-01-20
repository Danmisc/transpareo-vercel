"use client";

import { ArrowLeft, MapPin, Users, Star, Shield, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NeighborhoodHeaderProps {
    community: any;
}

export function NeighborhoodHeader({ community }: NeighborhoodHeaderProps) {
    const { vibeScore } = community;

    return (
        <div className="relative bg-white border-b border-zinc-200">
            {/* Cover Image */}
            <div className="h-48 md:h-64 bg-zinc-100 overflow-hidden relative">
                {community.coverImage ? (
                    <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-teal-500 to-emerald-600" />
                )}
                <Link href="/" className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
            </div>

            <div className="container max-w-5xl mx-auto px-4 pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 relative z-10">
                    {/* Avatar/Map */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-zinc-200 overflow-hidden">
                        {community.image ? (
                            <img src={community.image} alt={community.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center rounded-xl text-zinc-300">
                                <MapPin size={40} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-zinc-900">{community.name}</h1>
                            {community.city && <span className="text-zinc-500 font-medium">{community.zipCode} {community.city}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600">
                            <span className="flex items-center gap-1"><Users size={16} /> {community._count.members} Voisins</span>
                            <span className="flex items-center gap-1"><MessageSquare size={16} /> {community._count.posts} Discussions</span>
                        </div>
                    </div>

                    {/* Vibe Score Card */}
                    {vibeScore ? (
                        <div className="bg-zinc-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 min-w-[200px]">
                            <div className="text-center">
                                <div className="text-3xl font-black text-emerald-400">{vibeScore.global}</div>
                                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Vibe Score</div>
                            </div>
                            <div className="flex-1 space-y-1 text-xs text-zinc-300">
                                <div className="flex justify-between"><span>Sécurité</span> <span className="text-white font-bold">{vibeScore.safety}</span></div>
                                <div className="flex justify-between"><span>Calme</span> <span className="text-white font-bold">{vibeScore.noise}</span></div>
                                <div className="flex justify-between"><span>Transports</span> <span className="text-white font-bold">{vibeScore.transport}</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl max-w-xs">
                            <p className="text-sm text-zinc-500">Pas encore d'avis sur ce quartier.</p>
                            <Button variant="link" size="sm" className="text-emerald-600 p-0 h-auto">Donner mon avis</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

