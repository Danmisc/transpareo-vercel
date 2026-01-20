"use client";

import { useEffect, useState } from "react";

export function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState<"down" | "up" | null>(null);
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const updateScrollDirection = () => {
            const scrollY = window.scrollY;
            const direction = scrollY > lastScrollY ? "down" : "up";

            const diff = Math.abs(scrollY - lastScrollY);

            if (diff > 5) { // Increased sensitivity slightly (10 -> 5) for smoother feel? Or keep 10. User said "fluid".
                setScrollDirection(direction);
                lastScrollY = scrollY > 0 ? scrollY : 0;
            }

            setIsAtTop(scrollY < 50);
        };

        window.addEventListener("scroll", updateScrollDirection, { passive: true });
        return () => {
            window.removeEventListener("scroll", updateScrollDirection);
        };
    }, []); // Logic is self-contained now

    return { scrollDirection, isAtTop };
}

