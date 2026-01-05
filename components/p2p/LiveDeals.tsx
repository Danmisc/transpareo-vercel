"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Clock, ArrowRight } from "lucide-react";

export function LiveDeals() {
    const deals = [
        {
            id: 1,
            title: "Appartement T2 - Paris 11",
            amount: 280000,
            yield: 4.8,
            duration: 24,
            risk: "A",
            funded: 78,
            timeLeft: "4j"
        },
        {
            id: 2,
            title: "Rénovation Loft - Lyon",
            amount: 150000,
            yield: 5.2,
            duration: 36,
            risk: "B+",
            funded: 45,
            timeLeft: "12j"
        },
        {
            id: 3,
            title: "Maison Pierre - Bordeaux",
            amount: 420000,
            yield: 4.1,
            duration: 200, // Months actually, simplified
            risk: "A+",
            funded: 92,
            timeLeft: "24h"
        }
    ];

    return (
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Opportunités en cours</h2>
                        <p className="text-zinc-500">Rejoignez les investisseurs sur ces projets vérifiés.</p>
                    </div>
                    <Button variant="outline" className="hidden sm:flex" >Voir tous les projets</Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {deals.map((deal) => (
                        <Card key={deal.id} className="group hover:shadow-xl transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <CardHeader className="p-0">
                                <div className="h-40 bg-zinc-200 dark:bg-zinc-800 w-full relative overflow-hidden rounded-t-xl">
                                    {/* Placeholder for image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <div className="flex items-center gap-1 text-white text-sm font-medium">
                                            <MapPin size={14} /> {deal.title}
                                        </div>
                                    </div>
                                    <Badge className="absolute top-3 right-3 bg-white/90 text-zinc-900 hover:bg-white">
                                        {deal.risk}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Rendement</p>
                                        <p className="text-2xl font-bold text-emerald-600">{deal.yield}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Durée</p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{deal.duration} mois</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Objectif: {(deal.amount / 1000)}k€</span>
                                        <span className="font-bold text-emerald-600">{deal.funded}%</span>
                                    </div>
                                    <Progress value={deal.funded} className="h-2 bg-zinc-100 dark:bg-zinc-800" indicatorClassName="bg-emerald-500" />
                                </div>

                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Clock size={12} /> Reste {deal.timeLeft} pour investir
                                </div>
                            </CardContent>
                            <CardFooter className="p-5 pt-0">
                                <Button className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 group-hover:scale-[1.02] transition-transform">
                                    Investir dès 100€
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
