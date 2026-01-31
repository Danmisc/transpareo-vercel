"use client";

import { motion } from "framer-motion";

export function TypingBubble() {
    return (
        <div className="flex items-center gap-1 px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-none w-fit">
            <motion.div
                className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
                className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
                className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
        </div>
    );
}
