"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export const ScrollReveal = ({ children, width = "fit-content", delay = 0, direction = "up" }: ScrollRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const getVariants = () => {
        const distance = 50;
        switch (direction) {
            case "up": return { hidden: { opacity: 0, y: distance }, visible: { opacity: 1, y: 0 } };
            case "down": return { hidden: { opacity: 0, y: -distance }, visible: { opacity: 1, y: 0 } };
            case "left": return { hidden: { opacity: 0, x: distance }, visible: { opacity: 1, x: 0 } };
            case "right": return { hidden: { opacity: 0, x: -distance }, visible: { opacity: 1, x: 0 } };
            case "none": return { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } };
        }
    };

    return (
        <div ref={ref} style={{ position: "relative", width }}>
            <motion.div
                variants={getVariants()}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.8, delay: delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
                {children}
            </motion.div>
        </div>
    );
};
