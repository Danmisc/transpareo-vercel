"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

interface GlobalHeaderProps {
    user?: any;
}

export function GlobalHeader({ user }: GlobalHeaderProps) {
    const pathname = usePathname();

    // Transparent only on P2P Landing Page
    const isTransparentPage = pathname === "/p2p";

    return <Header user={user} transparent={isTransparentPage} />;
}

