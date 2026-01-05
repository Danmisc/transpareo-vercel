"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function RadarView() {
    return (
        <div className="relative w-full aspect-square max-w-sm mx-auto bg-black rounded-full overflow-hidden border-2 border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
            {/* Grid Lines */}
            <div className="absolute inset-0 border-[1px] border-green-500/20 rounded-full scale-75" />
            <div className="absolute inset-0 border-[1px] border-green-500/20 rounded-full scale-50" />
            <div className="absolute inset-0 border-[1px] border-green-500/20 rounded-full scale-25" />

            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-[1px] bg-green-500/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-[1px] bg-green-500/30" />
            </div>

            {/* Sweep Animation */}
            <motion.div
                className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-green-500/10 to-green-500/40"
                style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 0, 50% 0)" }} // Quarter pie roughly
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Blips (Mock Users) */}
            <RadarBlip x={60} y={30} delay={0.5} />
            <RadarBlip x={20} y={60} delay={1.2} />
            <RadarBlip x={75} y={75} delay={2.3} />
            <RadarBlip x={40} y={40} delay={3.1} />

            {/* Center (You) */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-green-500/50 z-20" />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping" />
        </div>
    );
}

function RadarBlip({ x, y, delay }: { x: number, y: number, delay: number }) {
    return (
        <motion.div
            className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                delay: delay,
                repeatDelay: 2 // Wait for sweep
            }}
        />
    );
}
