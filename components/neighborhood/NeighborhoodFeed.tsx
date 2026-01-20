"use client";

import { useState } from "react";
import { CreatePost } from "@/components/feed/CreatePost";
import { FeedList } from "@/components/feed/FeedList";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle, Star } from "lucide-react";

interface NeighborhoodFeedProps {
    communityId: string;
    currentUser: any;
    initialPosts: any[]; // Should filter by communityId in parent
}

export function NeighborhoodFeed({ communityId, currentUser, initialPosts }: NeighborhoodFeedProps) {
    const [activeTab, setActiveTab] = useState<"FEED" | "QA" | "REVIEWS">("FEED");

    // Filter logic would ideally be server-side, but for now we filter client-side or assume initialPosts matches context
    // In a real app, clicking tabs would fetch filtered data.

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Main Content */}
            <main className="space-y-6">
                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-1">
                    <button
                        onClick={() => setActiveTab("FEED")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "FEED" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
                    >
                        Fil d'actu
                    </button>
                    <button
                        onClick={() => setActiveTab("QA")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "QA" ? "border-emerald-500 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
                    >
                        <HelpCircle size={16} /> Questions aux Locaux
                    </button>
                    <button
                        onClick={() => setActiveTab("REVIEWS")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "REVIEWS" ? "border-orange-500 text-orange-600" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
                    >
                        <Star size={16} /> Avis Vibe
                    </button>
                </div>

                {/* Content */}
                {activeTab === "FEED" && (
                    <>
                        <CreatePost currentUser={currentUser} communityId={communityId} placeholder="Partagez une info sur le quartier..." />
                        <FeedList initialPosts={initialPosts} userId={currentUser.id} currentUserProfile={currentUser} />
                    </>
                )}

                {activeTab === "QA" && (
                    <>
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-4 mb-6">
                            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                <HelpCircle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900">Posez vos questions aux voisins !</h3>
                                <p className="text-sm text-emerald-700 mt-1">
                                    Est-ce que c'est bruyant le samedi soir ? Y a-t-il une bonne boulangerie ?
                                    Les locaux vous répondent.
                                </p>
                            </div>
                        </div>
                        <CreatePost currentUser={currentUser} communityId={communityId} placeholder="Posez une question..." defaultType="QUESTION" />
                        {/* We would filter displayed posts by type='QUESTION' here */}
                        <FeedList initialPosts={initialPosts.filter((p: any) => p.type === "QUESTION")} userId={currentUser.id} currentUserProfile={currentUser} />
                    </>
                )}

                {activeTab === "REVIEWS" && (
                    <div className="text-center py-12 text-zinc-500">
                        <Star size={48} className="mx-auto text-zinc-200 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900">Les avis sont en cours de modération</h3>
                        <p>Revenez bientôt pour voir ce que les gens pensent vraiment de ce quartier.</p>
                    </div>
                )}
            </main>

            {/* Sidebar */}
            <aside className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-4">À propos</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                        Bienvenue dans la communauté du quartier. Ici on s'entraide, on se partage les bons plans et on discute de la vie locale.
                    </p>
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                        <Button className="w-full bg-zinc-900 text-white">Rejoindre ce quartier</Button>
                    </div>
                </div>

                {/* Top Contributors */}
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-4">Top Voisins</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-100" />
                                <div className="flex-1">
                                    <div className="h-3 w-24 bg-zinc-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
}

