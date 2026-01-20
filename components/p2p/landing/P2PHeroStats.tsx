"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, PiggyBank, Building2 } from "lucide-react";

interface StatItem {
    label: string;
    value: number;
    suffix: string;
    prefix?: string;
    icon: typeof TrendingUp;
}

const stats: StatItem[] = [
    { label: "Investisseurs actifs", value: 15847, suffix: "", icon: Users },
    { label: "Montant financé", value: 47.2, suffix: "M€", icon: PiggyBank },
    { label: "Rendement moyen", value: 9.8, suffix: "%", icon: TrendingUp },
    { label: "Projets financés", value: 342, suffix: "", icon: Building2 },
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const isDecimal = target % 1 !== 0;

    useEffect(() => {
        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (target - startValue) * easeOut;

            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [target, duration]);

    return (
        <span className="tabular-nums">
            {isDecimal ? count.toFixed(1) : Math.round(count).toLocaleString('fr-FR')}
        </span>
    );
}

export function P2PHeroStats() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full max-w-5xl mx-auto">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className={`group relative p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <div className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-1">
                            {stat.prefix}
                            {isVisible ? <AnimatedCounter target={stat.value} /> : '0'}
                            {stat.suffix}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            {stat.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

