"use client";

import { motion } from "framer-motion";

export function AnimatedHeroBackground() {
    return (
        <div className="absolute inset-0 bg-orange-50/50 dark:bg-zinc-950 overflow-hidden pointer-events-none transition-colors duration-500">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], x: [0, 50, 0], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-amber-300/20 dark:bg-amber-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
            />
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-40 dark:opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
    );
}
