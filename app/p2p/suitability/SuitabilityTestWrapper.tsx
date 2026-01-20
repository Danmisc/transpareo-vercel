"use client";

import { SuitabilityTest } from "@/components/p2p/SuitabilityTest";

export function SuitabilityTestWrapper() {
    return (
        <SuitabilityTest
            onComplete={(sophistication) => {
                window.location.href = "/p2p/market";
            }}
            onSkip={() => {
                window.location.href = "/p2p/dashboard";
            }}
        />
    );
}

