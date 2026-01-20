"use client";

import { TenantIdentityCard } from "./TenantIdentityCard";
import { ActionCenter } from "./ActionCenter";
import { SolvencyCertifier } from "./SolvencyCertifier";
import { DocumentVault } from "./DocumentVault";
import { DossierScoreRing } from "./DossierScoreRing";
import {
    Sparkles,
    TrendingUp,
    ShieldCheck,
    FileCheck,
    AlertCircle,
    ChevronRight,
    Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface OverviewTabProps {
    user: any;
    dossier: any;
    documents?: any[];
}

export function OverviewTab({ user, dossier, documents }: OverviewTabProps) {
    // Mock AI Scoring Logic
    const calculateScore = () => {
        let score = 30; // Base score
        if (dossier?.verifiedIncome) score += 20;
        if (dossier?.guarantors?.length > 0) score += 15;
        if (dossier?.videoPitchUrl) score += 10;
        if (documents && documents.length > 2) score += 15;
        if (dossier?.recommendations?.length > 0) score += 10;
        return Math.min(100, score);
    };

    const score = calculateScore();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Top Section: Identity + Primary KPI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Identity Card - Takes 2 cols */}
                <div className="lg:col-span-2">
                    <TenantIdentityCard user={user} dossier={dossier} />
                </div>

                {/* Trust Score Card - Takes 1 col */}
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-wider font-bold">
                            <Sparkles size={16} className="text-orange-400" /> Trust Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6 relative z-10">
                        <div className="relative">
                            <DossierScoreRing score={score} size={120} strokeWidth={10} />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-black">{score}</span>
                                <span className="text-[10px] text-zinc-400 uppercase">Points</span>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col items-center gap-2 w-full">
                            <Button size="sm" className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-bold rounded-xl h-9">
                                <TrendingUp size={14} className="mr-2" /> Améliorer mon score
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Grid - "Cockpit Style" */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase">Revenus</p>
                            <p className="text-sm font-bold text-zinc-900">Vérifiés (Connect)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase">Documents</p>
                            <p className="text-sm font-bold text-zinc-900">4/5 Validés</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Star size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase">Avis</p>
                            <p className="text-sm font-bold text-zinc-900">3 Recommandations</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-600 font-bold uppercase flex items-center gap-1">
                                <AlertCircle size={12} /> Action
                            </p>
                            <p className="text-sm font-bold text-orange-900">Ajouter Garant</p>
                        </div>
                        <ChevronRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                </Card>
            </div>

            {/* Two Column Layout for Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Action Center & Solvency */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900">Actions Prioritaires</h3>
                    </div>
                    <ActionCenter />
                    <SolvencyCertifier userId={user.id} dossier={dossier} />
                </div>

                {/* Right: Quick Documents */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900">Documents Récents</h3>
                        <Button variant="link" className="text-orange-600 font-bold text-xs">Tout voir</Button>
                    </div>
                    <DocumentVault documents={documents || []} userId={user.id} />
                </div>
            </div>
        </div>
    );
}

