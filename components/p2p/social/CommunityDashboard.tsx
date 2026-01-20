"use client";

import { ReferralCard } from "./ReferralCard";
import { NetworkList } from "./NetworkList";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { SocialFeed } from "./SocialFeed";

interface CommunityDashboardProps {
    data: {
        referralCode?: string | null;
        reputation?: number;
        trustScore: number;
        receivedVouches: any[];
        sentVouches: any[];
        referrals: any[];
        activities: any[];
    };
}

export function CommunityDashboard({ data }: CommunityDashboardProps) {
    // Determine Trust Level
    let level = "Débutant";
    let color = "text-zinc-500";
    if (data.trustScore > 50) { level = "Confirmé"; color = "text-blue-500"; }
    if (data.trustScore > 100) { level = "Expert"; color = "text-emerald-500"; }
    if (data.trustScore > 500) { level = "Légende"; color = "text-orange-500"; }

    return (
        <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column: Stats & Referral */}
            <div className="space-y-8">
                {/* Trust Score Card */}
                <Card className="border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
                    <CardContent className="p-6 text-center">
                        <div className="mx-auto w-24 h-24 rounded-full bg-zinc-50 dark:bg-white/5 flex items-center justify-center mb-4 relative">
                            <ShieldCheck size={48} className={color} />
                            <div className="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-white/5" />
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h3 className="text-3xl font-black text-zinc-900 dark:text-white">{data.trustScore}</h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><Info size={14} className="text-zinc-400" /></TooltipTrigger>
                                    <TooltipContent>Points calculés sur la base de vos parrainages et recommandations.</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p className={`text-sm font-bold uppercase tracking-wider ${color}`}>{level}</p>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-xs text-zinc-500">
                                <span>Progression (Prochain niveau: 100)</span>
                                <span>{data.trustScore}%</span>
                            </div>
                            <Progress value={data.trustScore} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                <ReferralCard initialCode={data.referralCode} />
            </div>

            {/* Right Column: Network & Activity */}
            <div className="lg:col-span-2 space-y-8">
                <NetworkList
                    receivedVouches={data.receivedVouches}
                    sentVouches={data.sentVouches}
                    referrals={data.referrals}
                />

                <SocialFeed activities={data.activities} />
            </div>
        </div>
    );
}

