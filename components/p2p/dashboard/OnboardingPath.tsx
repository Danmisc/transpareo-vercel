"use client";

import { motion } from "framer-motion";
import {
    Mail,
    ShieldCheck,
    FileCheck,
    TrendingUp,
    CheckCircle2,
    Lock,
    ArrowRight,
    ChevronRight,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OnboardingStep } from "@/lib/actions-onboarding";

const ICONS: Record<string, any> = {
    Mail,
    ShieldCheck,
    FileCheck,
    TrendingUp
};

interface OnboardingPathProps {
    data: {
        progress: number;
        steps: OnboardingStep[];
        currentStepIndex: number;
    } | null;
}

export function OnboardingPath({ data }: OnboardingPathProps) {
    if (!data) return null;

    // If 100% complete, maybe show a "Pro Level" badge or hide the stepper?
    // For now, if 100%, we show a minimized "Status: Banking Verified" card.
    if (data.progress === 100) {
        return (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white flex items-center justify-between shadow-lg mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-full">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Compte Bancaire Activé</h3>
                        <p className="text-emerald-100 text-sm">Votre infrastructure est prête pour l'investissement.</p>
                    </div>
                </div>
                <div className="bg-white/10 px-4 py-1 rounded-full text-xs font-mono">TIER 3 VERIFIED</div>
            </div>
        );
    }

    const currentStep = data.steps[data.currentStepIndex];

    return (
        <div className="bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 mb-8 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                ÉTAPE {data.currentStepIndex + 1}/{data.steps.length}
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide text-sm uppercase">Verification Path</span>
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                            Activez votre Banque P2P
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg">
                            Complétez ces étapes de sécurité pour débloquer les fonctionnalités bancaires, les prêts et l'investissement automatisé.
                        </p>
                    </div>

                    <div className="bg-indigo-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-indigo-100 dark:border-zinc-700 min-w-[280px]">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Niveau de maturité</span>
                            <span className="text-2xl font-bold text-indigo-600">{Math.round(data.progress)}%</span>
                        </div>
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Steps Horizontal */}
                <div className="flex flex-col md:flex-row gap-4 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10" />

                    {data.steps.map((step, idx) => {
                        const Icon = ICONS[step.icon || "ShieldCheck"];
                        const isActive = idx === data.currentStepIndex;
                        const isCompleted = step.status === "COMPLETED";
                        const isLocked = step.status === "LOCKED";

                        return (
                            <div key={step.id} className={`flex-1 relative group ${isActive ? 'md:-mt-2' : ''}`}>
                                <div className={`
                                    relative p-4 rounded-xl border transition-all duration-300
                                    ${isActive
                                        ? 'bg-white dark:bg-zinc-800 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-105 z-20'
                                        : isCompleted
                                            ? 'bg-zinc-50 dark:bg-zinc-900/50 border-emerald-200 dark:border-emerald-900/30 opacity-80'
                                            : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-60 grayscale'
                                    }
                                `}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-100 text-indigo-600' :
                                            isCompleted ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-zinc-200 text-zinc-500'
                                            }`}>
                                            <Icon size={20} />
                                        </div>
                                        {isCompleted && <CheckCircle2 size={20} className="text-emerald-500" />}
                                        {isLocked && <Lock size={16} className="text-zinc-400" />}
                                        {isActive && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                                    </div>

                                    <h3 className={`font-semibold mb-1 ${isActive ? 'text-indigo-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {step.label}
                                    </h3>
                                    <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2.5em]">
                                        {step.description}
                                    </p>

                                    {isActive && step.actionUrl && (
                                        <div className="mt-4">
                                            <Link href={step.actionUrl}>
                                                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-8">
                                                    Commencer <ArrowRight size={12} className="ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

