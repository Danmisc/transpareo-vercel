"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DossierScoreRingProps {
    score: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
}

export function DossierScoreRing({ score, size = 120, strokeWidth = 8 }: DossierScoreRingProps) {
    const [currentScore, setCurrentScore] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        const timer = setTimeout(() => setCurrentScore(score), 500);
        return () => clearTimeout(timer);
    }, [score]);

    const offset = circumference - (currentScore / 100) * circumference;

    const getColor = (s: number) => {
        if (s < 50) return "#ef4444"; // Red
        if (s < 80) return "#fbbf24"; // Amber
        return "#10b981"; // Emerald
    };

    const getLabel = (s: number) => {
        if (s < 50) return "Incomplet";
        if (s < 80) return "Bon";
        return "Excellent";
    };

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Ring */}
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#fee2e2" // zinc-100 or similar
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-zinc-100"
                />
                {/* Progress Ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor(currentScore)}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-zinc-900 leading-none">
                    {Math.round(currentScore)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: getColor(currentScore) }}>
                    {getLabel(currentScore)}
                </span>
            </div>

            {/* Floating Badge (Optional decorative) */}
            {currentScore >= 90 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg"
                >
                    TOP 5%
                </motion.div>
            )}
        </div>
    );
}

