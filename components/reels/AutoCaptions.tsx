"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function AutoCaptions({ text, isActive }: { text: string, isActive: boolean }) {
    // This is a UI Mock essentially
    if (!text) return null;

    return (
        <div className={cn(
            "absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-md transition-opacity duration-300 pointer-events-none",
            isActive ? "opacity-100" : "opacity-0"
        )}>
            {text}
        </div>
    );
}

