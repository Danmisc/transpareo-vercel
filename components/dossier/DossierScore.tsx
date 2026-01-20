"use client";

import { motion } from "framer-motion";

interface DossierScoreProps {
    score: number; // 0 to 100
}

export function DossierScore({ score }: DossierScoreProps) {
    const radius = 60;
    const stroke = 8; // Thinner stroke for pro look
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s < 50) return "#ef4444"; // red
        if (s < 80) return "#f97316"; // orange
        return "#22c55e"; // green
    };

    const color = getColor(score);

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
                <svg
                    height="100%"
                    width="100%"
                    viewBox="0 0 120 120"
                    className="transform -rotate-90"
                >
                    {/* Background Circle */}
                    <circle
                        stroke="#f4f4f5"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx="60"
                        cy="60"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx="60"
                        cy="60"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ strokeDasharray: circumference }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-4xl font-extrabold text-zinc-900 tracking-tight"
                    >
                        {score}<span className="text-xl align-top">%</span>
                    </motion.span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">
                        Qualité
                    </span>
                </div>
            </div>
        </div>
    );
}

