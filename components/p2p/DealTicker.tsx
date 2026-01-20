"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DealTicker() {
    const activities = [
        { name: "Sophie D.", action: "a investi", amount: "2,000€", project: "T2 Paris 11", time: "2m" },
        { name: "Marc L.", action: "a financé", amount: "500€", project: "Loft Lyon", time: "5m" },
        { name: "Thomas R.", action: "a investi", amount: "10,000€", project: "Maison Bordeaux", time: "12m" },
        { name: "Invest Corp", action: "a complété", amount: "45,000€", project: "Immeuble Lille", time: "15m" },
        { name: "Julie M.", action: "a investi", amount: "150€", project: "T2 Paris 11", time: "18m" },
    ];

    return (
        <div className="w-full bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm border-y border-zinc-200 dark:border-white/5 overflow-hidden py-3 transition-colors duration-500">
            <div className="flex gap-12 animate-scroll whitespace-nowrap">
                {[...activities, ...activities, ...activities].map((act, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                        <Avatar className="h-6 w-6 border border-zinc-200 dark:border-white/10">
                            <AvatarFallback className="bg-orange-100 dark:bg-zinc-800 text-[10px] text-orange-700 dark:text-zinc-400">{act.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-zinc-600 dark:text-zinc-400">
                            <strong className="text-zinc-900 dark:text-zinc-200">{act.name}</strong> {act.action} <span className="text-orange-600 dark:text-orange-400 font-mono font-bold">{act.amount}</span> sur {act.project}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-600 text-xs">• {act.time}</span>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33%); }
                }
            `}</style>
        </div>
    );
}

