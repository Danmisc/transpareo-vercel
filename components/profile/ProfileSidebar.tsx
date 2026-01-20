"use client";

import { UserPlus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export function ProfileSidebar() {
    const similarProfiles = [
        { name: "Sophie Martin", role: "Locataire", headline: "Recherche T2 Paris", avatar: "/avatars/02.png" },
        { name: "Thomas Dubois", role: "Locataire", headline: "Ingénieur @ Google", avatar: "/avatars/03.png" },
        { name: "Marie Leroy", role: "Propriétaire", headline: "Investisseur Lyon", avatar: "/avatars/04.png" }
    ];

    return (
        <div className="space-y-6">
            {/* Ad Space (Premium Native Style) */}
            <div className="rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600" className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700" alt="Ad" />
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-white/20">Sponsorisé</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 z-20 text-white space-y-1">
                    <p className="font-bold text-lg leading-tight group-hover:text-orange-400 transition-colors">Assurance Loyer Impayé</p>
                    <p className="text-sm text-zinc-300 line-clamp-2">Sécurisez vos revenus locatifs dès aujourd'hui avec notre offre exclusive.</p>
                    <div className="pt-2">
                        <span className="text-xs font-semibold bg-white text-black px-3 py-1.5 rounded-full">En savoir plus</span>
                    </div>
                </div>
            </div>

            {/* People Also Viewed */}
            <Card className="border-0 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Profils Similaires
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="space-y-4">
                        {similarProfiles.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                                <Avatar className="w-10 h-10 border border-border">
                                    <AvatarImage src={p.avatar} />
                                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate text-foreground group-hover:text-orange-600 transition-colors">
                                        {p.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {p.headline}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-full">
                                    <UserPlus className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Suggested Properties */}
            <Card className="border-0 shadow-sm bg-white dark:bg-zinc-950">
                <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        Opportunités
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="space-y-5">
                        <div className="flex gap-4 group cursor-pointer">
                            <div className="w-20 h-20 rounded-xl bg-zinc-200 shrink-0 overflow-hidden relative shadow-sm">
                                <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                <div className="absolute top-1 left-1 bg-white/90 backdrop-blur rounded px-1.5 py-0.5 text-[10px] font-bold text-black">T2</div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="font-bold text-sm text-foreground group-hover:text-orange-600 transition-colors">Paris 11ème, Bastille</div>
                                <div className="text-xs text-muted-foreground mt-0.5">45m² • Étage 2</div>
                                <div className="text-sm font-bold text-foreground mt-1">1 200 € <span className="text-xs font-normal text-muted-foreground">/mois</span></div>
                            </div>
                        </div>
                        <div className="flex gap-4 group cursor-pointer">
                            <div className="w-20 h-20 rounded-xl bg-zinc-200 shrink-0 overflow-hidden relative shadow-sm">
                                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                <div className="absolute top-1 left-1 bg-white/90 backdrop-blur rounded px-1.5 py-0.5 text-[10px] font-bold text-black">T3</div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="font-bold text-sm text-foreground group-hover:text-orange-600 transition-colors">Bordeaux Centre</div>
                                <div className="text-xs text-muted-foreground mt-0.5">65m² • Balcon</div>
                                <div className="text-sm font-bold text-foreground mt-1">950 € <span className="text-xs font-normal text-muted-foreground">/mois</span></div>
                            </div>
                        </div>
                        <Link href="/marketplace" className="block text-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-orange-200 transition-all">
                            Voir toutes les opportunités
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
