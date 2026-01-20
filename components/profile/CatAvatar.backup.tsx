"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type CatTraits = {
    background: "blue" | "green" | "orange" | "purple" | "yellow" | "zinc" | "galaxy";
    skin: "orange" | "black" | "white" | "grey";
    eyes: "normal" | "happy" | "cool" | "winking" | "surprised";
    mouth: "smile" | "toungue" | "neutral" | "open";
    clothing: "none" | "suit" | "hoodie" | "shirt" | "bowtie" | "kimono" | "space_suit";
    hat: "none" | "cap" | "party" | "headphones" | "crown" | "helmet";
    accessory: "none" | "glasses" | "scarf" | "laptop";
};

export const DEFAULT_CAT_TRAITS: CatTraits = {
    background: "orange",
    skin: "orange",
    eyes: "normal",
    mouth: "smile",
    clothing: "none",
    hat: "none",
    accessory: "none"
};

interface CatAvatarProps {
    traits?: CatTraits;
    className?: string;
    size?: number;
}

export function CatAvatar({ traits = DEFAULT_CAT_TRAITS, className, size = 120 }: CatAvatarProps) {
    const { background, skin, eyes, mouth, clothing, hat, accessory } = traits;

    // Skin Colors with more depth
    const skinColors = {
        orange: { base: "#FF9A5C", shadow: "#E67E45", stripe: "#CC6A36", light: "#FFB080" },
        black: { base: "#333333", shadow: "#1a1a1a", stripe: "#444444", light: "#4D4D4D" },
        white: { base: "#F0F0F0", shadow: "#D6D6D6", stripe: "#FFFFFF", light: "#FFFFFF" },
        grey: { base: "#9CA3AF", shadow: "#6B7280", stripe: "#4B5563", light: "#D1D5DB" },
    };
    const c = skinColors[skin];

    // Background Colors with gradients
    const bgColors = {
        blue: ["#DBEAFE", "#60A5FA"],
        green: ["#DCFCE7", "#4ADE80"],
        orange: ["#FFEDD5", "#FB923C"],
        purple: ["#F3E8FF", "#A78BFA"],
        yellow: ["#FEF9C3", "#FACC15"],
        zinc: ["#F4F4F5", "#A1A1AA"],
        galaxy: ["#0f172a", "#312e81", "#4c1d95"], // Deep space tri-color
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            className={cn("rounded-full shadow-inner", className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id={`bg-${background}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={bgColors[background][0]} />
                    <stop offset="100%" stopColor={bgColors[background] ? bgColors[background][1] : bgColors[background][1]} />
                </linearGradient>
                <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background */}
            <circle cx="100" cy="100" r="100" fill={`url(#bg-${background})`} />

            {/* Background Patterns */}
            <g opacity="0.3">
                {background === 'galaxy' ? (
                    <g fill="white">
                        <circle cx="50" cy="40" r="1.5" />
                        <circle cx="150" cy="30" r="2" />
                        <circle cx="30" cy="120" r="1" />
                        <circle cx="170" cy="150" r="1.5" />
                        <circle cx="120" cy="180" r="2" />
                        <circle cx="90" cy="20" r="1" />
                        <path d="M100 50 L102 55 L107 57 L102 59 L100 64 L98 59 L93 57 L98 55 Z" fill="white" />
                    </g>
                ) : (
                    // Subtle Polka dots for other backgrounds
                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="white" />
                    </pattern>
                )}
                {background !== 'galaxy' && <circle cx="100" cy="100" r="100" fill="url(#dots)" />}
            </g>

            {/* BODY & HEAD GROUP - Centered and Scaled */}
            <g transform="translate(100, 120)"> {/* Adjusted center */}

                {/* 1. BODY - MEDIUM CHIBI (Perfect Balance) */}
                <g transform="translate(0, 10)">
                    {/* 
                        New Body Path: "Plump Bean" - Wider shoulders than tiny, rounder than blocky.
                        M -32 22: Start Left Shoulder
                        Q -45 60 -40 95: Left side
                        L 40 95: Bottom
                        Q 45 60 32 22: Right side
                        Q 0 12 -32 22: Neck
                     */}

                    {/* DEFAULT BODY (Fur/Naked) - The Base */}
                    {clothing === "none" && (
                        <path d="M-32 22 Q-48 60 -42 95 L42 95 Q48 60 32 22 Q0 12 -32 22" fill={c.base} stroke="#18181B" strokeWidth="3" />
                    )}

                    {/* SUIT - Clean Executive */}
                    {clothing === "suit" && (
                        <g>
                            <path d="M-34 22 Q-50 60 -44 95 L44 95 Q50 60 34 22 Q0 12 -34 22" fill="#111827" stroke="#000000" strokeWidth="3" />
                            {/* Shirt V */}
                            <path d="M-34 22 L0 80 L34 22 Q0 12 -34 22" fill="white" />
                            {/* Lapels - Minimalist */}
                            <path d="M-34 22 L-10 65 L-14 22" fill="#1F2937" stroke="#000000" strokeWidth="1" />
                            <path d="M34 22 L10 65 L14 22" fill="#1F2937" stroke="#000000" strokeWidth="1" />
                            {/* Tie - Clean and Sharp */}
                            <path d="M0 22 L-6 32 L0 75 L6 32 Z" fill="#DC2626" />
                        </g>
                    )}

                    {/* HOODIE - Clean & Cozy */}
                    {clothing === "hoodie" && (
                        <g>
                            {/* Hood Back */}
                            <path d="M-22 15 Q0 5 22 15" fill="#4338CA" stroke="#312E81" strokeWidth="3" />
                            {/* Body */}
                            <path d="M-36 22 Q-53 60 -46 95 L46 95 Q53 60 36 22 Q0 12 -36 22" fill="#6366F1" stroke="#312E81" strokeWidth="3" />
                            {/* Pocket - Simple Curve */}
                            <path d="M-20 65 L20 65 L15 90 L-15 90 Z" fill="#4338CA" opacity="0.6" />
                            {/* Strings - Straight & Clean */}
                            <line x1="-10" y1="35" x2="-10" y2="60" stroke="#E0E7FF" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="10" y1="35" x2="10" y2="60" stroke="#E0E7FF" strokeWidth="2.5" strokeLinecap="round" />
                        </g>
                    )}

                    {/* SHIRT - Modern Casual */}
                    {clothing === "shirt" && (
                        <g>
                            <path d="M-34 22 Q-50 60 -44 95 L44 95 Q50 60 34 22 Q0 12 -34 22" fill="#10B981" stroke="#065F46" strokeWidth="3" />
                            {/* Collar - Clean Geometry */}
                            <path d="M-18 22 L0 38 L18 22" fill="none" stroke="#065F46" strokeWidth="2" />
                            <path d="M0 22 L0 95" stroke="#065F46" strokeWidth="1" opacity="0.2" /> {/* Subtle Placket line */}
                            {/* Buttons */}
                            <circle cx="0" cy="50" r="2.5" fill="#D1FAE5" />
                            <circle cx="0" cy="70" r="2.5" fill="#D1FAE5" />
                        </g>
                    )}

                    {/* KIMONO - Minimal Zen */}
                    {clothing === "kimono" && (
                        <g>
                            <path d="M-36 22 Q-52 60 -44 95 L44 95 Q52 60 36 22 Q0 12 -36 22" fill="#7C2D12" stroke="#451A03" strokeWidth="3" />
                            {/* Simple Diagonal Folds */}
                            <path d="M-36 22 L36 85 L36 22" fill="#9A3412" />
                            <path d="M36 22 L-36 85 L-36 22" fill="none" stroke="#451A03" strokeWidth="1" /> {/* Outline only for top fold to avoid double fill logic issues */}
                            <path d="M34 22 L-36 85" stroke="#451A03" strokeWidth="1" />

                            {/* Obi - Solid Block */}
                            <rect x="-38" y="60" width="76" height="15" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                        </g>
                    )}

                    {/* SPACE SUIT - Iconic */}
                    {clothing === "space_suit" && (
                        <g>
                            <path d="M-38 22 Q-55 60 -46 95 L46 95 Q55 60 38 22 Q0 12 -38 22" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="3" />
                            {/* Center Panel - Clean Rect */}
                            <rect x="-18" y="45" width="36" height="22" rx="4" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
                            {/* Simple Buttons */}
                            <circle cx="-6" cy="56" r="3" fill="#EF4444" />
                            <circle cx="6" cy="56" r="3" fill="#3B82F6" />
                        </g>
                    )}

                    {/* BOWTIE - Crisp */}
                    {clothing === "bowtie" && (
                        <g>
                            <path d="M-32 22 Q-48 60 -42 95 L42 95 Q48 60 32 22 Q0 12 -32 22" fill={c.base} stroke="#18181B" strokeWidth="3" />
                            <g transform="translate(0, 32)">
                                <path d="M0 0 L-14 8 L-14 -8 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
                                <path d="M0 0 L14 8 L14 -8 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
                                <circle cx="0" cy="0" r="3" fill="#991B1B" />
                            </g>
                        </g>
                    )}
                </g>

                {/* 2. HEAD - Balanced Size */}
                <g transform="translate(0, -28)">
                    {/* NECK SHADOW */}
                    <ellipse cx="0" cy="38" rx="22" ry="7" fill="#000000" opacity="0.15" />

                    <g filter="url(#soft-shadow)">
                        {/* Ears - Short & Round */}
                        <path d="M-35 -30 L-45 -55 L-15 -40 Z" fill={c.base} stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M35 -30 L45 -55 L15 -40 Z" fill={c.base} stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M-36 -32 L-40 -48 L-22 -38 Z" fill="#FDA4AF" />
                        <path d="M36 -32 L40 -48 L22 -38 Z" fill="#FDA4AF" />

                        {/* Head Shape - Wide Squircle */}
                        <rect x="-55" y="-40" width="110" height="85" rx="42" fill={c.base} stroke="#18181B" strokeWidth="3" />

                        {/* Cheeks - Rosy */}
                        <circle cx="-35" cy="15" r="7" fill="#FDA4AF" opacity="0.4" />
                        <circle cx="35" cy="15" r="7" fill="#FDA4AF" opacity="0.4" />

                        {/* Stripes - Cute */}
                        <g opacity="0.8">
                            <path d="M0 -40 L0 -25" stroke={c.stripe} strokeWidth="4" strokeLinecap="round" />
                            <path d="M-18 -38 L-18 -28" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                            <path d="M18 -38 L18 -28" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                            <path d="M-55 0 L-40 0" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                            <path d="M55 0 L40 0" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                        </g>

                        {/* FACE FEATURES */}
                        <g transform="translate(0, 5)">
                            {/* EYES - Big & Low */}
                            <g transform="translate(0, 0)">
                                {eyes === "normal" && (
                                    <>
                                        <circle cx="-22" cy="0" r="9" fill="#18181B" />
                                        <circle cx="22" cy="0" r="9" fill="#18181B" />
                                        <circle cx="-18" cy="-3" r="3.5" fill="white" />
                                        <circle cx="26" cy="-3" r="3.5" fill="white" />
                                    </>
                                )}
                                {eyes === "happy" && (
                                    <>
                                        <path d="M-30 2 Q-22 -5 -14 2" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
                                        <path d="M14 2 Q22 -5 30 2" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
                                    </>
                                )}
                                {eyes === "winking" && (
                                    <>
                                        <circle cx="-22" cy="0" r="9" fill="#18181B" />
                                        <circle cx="-18" cy="-3" r="3.5" fill="white" />
                                        <path d="M14 2 Q22 -5 30 2" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
                                    </>
                                )}
                                {eyes === "surprised" && (
                                    <>
                                        <circle cx="-22" cy="0" r="9" fill="#18181B" />
                                        <circle cx="22" cy="0" r="9" fill="#18181B" />
                                        <path d="M-30 -12 Q-22 -18 -14 -12" fill="none" stroke="#18181B" strokeWidth="1.5" />
                                        <path d="M14 -12 Q22 -18 30 -12" fill="none" stroke="#18181B" strokeWidth="1.5" />
                                    </>
                                )}
                                {eyes === "cool" && (
                                    <g>
                                        {/* Pixel Art Style Sunglasses or Aviator? Let's go Aviator/Sleek */}
                                        <defs>
                                            <linearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#4B5563" />
                                                <stop offset="50%" stopColor="#1F2937" />
                                                <stop offset="100%" stopColor="#000000" />
                                            </linearGradient>
                                        </defs>

                                        {/* Frames */}
                                        <path d="M-42 -6 C-42 -14 -28 -14 -22 -6 L-20 6 C-24 14 -42 14 -42 -6 Z" fill="url(#glassGradient)" stroke="#111827" strokeWidth="2" />
                                        <path d="M42 -6 C42 -14 28 -14 22 -6 L20 6 C24 14 42 14 42 -6 Z" fill="url(#glassGradient)" stroke="#111827" strokeWidth="2" />

                                        {/* Bridge */}
                                        <path d="M-22 -8 Q0 -12 22 -8" fill="none" stroke="#111827" strokeWidth="2" />
                                        <path d="M-22 -6 L22 -6" fill="none" stroke="#111827" strokeWidth="1" opacity="0.5" />

                                        {/* Reflections for "Perfect Cool" look */}
                                        <path d="M-38 -8 L-28 -4" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
                                        <path d="M28 -4 L38 -8" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
                                    </g>
                                )}
                            </g>

                            {/* MOUTH & NOSE */}
                            <g transform="translate(0, 10)">
                                {/* Nose - Tiny Triangle/Heart - NO ELONGATION */}
                                <path d="M-3 -4 Q0 -2 3 -4 L0 -1 Z" fill="#FDA4AF" stroke="none" />

                                {mouth === "smile" && (
                                    <path d="M-6 4 Q0 8 6 4" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                                )}
                                {mouth === "toungue" && (
                                    <>
                                        <path d="M-6 4 Q0 8 6 4" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M-2.5 6 Q0 9 2.5 6" fill="#FDA4AF" stroke="#18181B" strokeWidth="1" />
                                    </>
                                )}
                                {mouth === "neutral" && (
                                    <path d="M-3 6 L3 6" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                                )}
                                {mouth === "open" && (
                                    <circle cx="0" cy="5" r="2.5" fill="#18181B" />
                                )}
                            </g>
                        </g>

                    </g>

                    {/* 3. ACCESSORIES (Face) */}
                    {accessory === "glasses" && eyes !== "cool" && (
                        <g transform="translate(0, 0)" filter="url(#soft-shadow)">
                            <circle cx="-22" cy="0" r="15" fill="rgba(255,255,255,0.2)" stroke="#18181B" strokeWidth="2.5" />
                            <circle cx="22" cy="0" r="15" fill="rgba(255,255,255,0.2)" stroke="#18181B" strokeWidth="2.5" />
                            <line x1="-7" y1="0" x2="7" y2="0" stroke="#18181B" strokeWidth="2.5" />
                            <line x1="-37" y1="0" x2="-50" y2="-8" stroke="#18181B" strokeWidth="2.5" />
                            <line x1="37" y1="0" x2="50" y2="-8" stroke="#18181B" strokeWidth="2.5" />
                        </g>
                    )}

                    {/* 4. HATS */}
                    <g transform="translate(0, -35)">
                        {hat === "cap" && (
                            <g transform="translate(0, -2)">
                                <path d="M-35 0 Q0 -15 35 0" fill="#2563EB" stroke="#1E3A8A" strokeWidth="3" />
                                <rect x="-30" y="-12" width="60" height="15" rx="4" fill="#2563EB" stroke="#1E3A8A" strokeWidth="3" />
                                <path d="M-35 0 L-45 8 Q0 15 45 8 L35 0" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="3" />
                            </g>
                        )}
                        {hat === "crown" && (
                            <g transform="translate(0, -15)">
                                <path d="M-20 15 L-20 -5 L-10 5 L0 -10 L10 5 L20 -5 L20 15 Z" fill="#FCD34D" stroke="#B45309" strokeWidth="3" />
                            </g>
                        )}
                        {hat === "party" && (
                            <g transform="translate(15, -25) rotate(15)">
                                <path d="M-12 25 L0 -5 L12 25 Z" fill="#EC4899" stroke="#BE185D" strokeWidth="3" />
                            </g>
                        )}
                        {hat === "helmet" && (
                            <g transform="translate(0, 25)"> {/* Shifted DOWN significantly to center on face */}
                                {/* Glass Bubble - Simple & Transparent */}
                                <circle cx="0" cy="-5" r="70" fill="rgba(219, 234, 254, 0.2)" stroke="#94A3B8" strokeWidth="2.5" />

                                {/* Reflection */}
                                <path d="M-40 -45 Q0 -65 40 -45" stroke="white" strokeWidth="3" opacity="0.4" strokeLinecap="round" fill="none" />
                                <ellipse cx="25" cy="-25" rx="12" ry="6" fill="white" opacity="0.3" transform="rotate(-45)" />

                                {/* Neck Ring - Connection */}
                                <path d="M-50 45 Q0 60 50 45" stroke="#64748B" strokeWidth="5" fill="none" strokeLinecap="round" />

                                {/* Simple Tech Detail (Antenna) - Optional, keeping it subtle */}
                                <line x1="0" y1="-75" x2="0" y2="-85" stroke="#94A3B8" strokeWidth="2" />
                                <circle cx="0" cy="-85" r="3" fill="#EF4444" />
                            </g>
                        )}
                        {hat === "headphones" && (
                            <g transform="translate(0, 15)">
                                <path d="M-45 15 Q-45 -35 0 -35 Q45 -35 45 15" fill="none" stroke="#1F2937" strokeWidth="6" />
                                <rect x="-55" y="0" width="12" height="30" rx="4" fill="#374151" stroke="#111827" strokeWidth="2" />
                                <rect x="43" y="0" width="12" height="30" rx="4" fill="#374151" stroke="#111827" strokeWidth="2" />
                            </g>
                        )}
                    </g>
                </g>

                {/* ACCESSORIES (Neck/Body level) */}
                {accessory === "scarf" && (
                    <g transform="translate(0, 20)"> {/* Situated on shoulders */}
                        {/* 1. Chunky Wrap - Thick and Soft */}
                        <path d="M-35 5 Q0 25 35 5" stroke="#F59E0B" strokeWidth="22" strokeLinecap="round" fill="none" />

                        {/* 2. Fold/Shadow for depth */}
                        <path d="M-32 8 Q0 28 32 8" stroke="#D97706" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.4" />

                        {/* 3. Knot Area - Big and Organic */}
                        <path d="M-20 15 L-20 50" stroke="#F59E0B" strokeWidth="18" strokeLinecap="round" />
                        <path d="M-20 15 L-20 50" stroke="#D97706" strokeWidth="18" strokeLinecap="round" opacity="0.1" />  {/* Texture overlay */}

                        {/* 4. Realistic Fringes */}
                        <g transform="translate(-20, 52)">
                            <path d="M-6 0 L-8 10" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
                            <path d="M-2 0 L-1 12" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
                            <path d="M2 0 L4 10" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
                            <path d="M6 0 L8 12" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
                        </g>
                    </g>
                )}
                {accessory === "laptop" && (
                    <g transform="translate(-35, 45)">
                        <rect x="0" y="0" width="70" height="45" rx="4" fill="#374151" stroke="#111827" strokeWidth="2" />
                        <path d="M10 22 L25 22" stroke="white" strokeWidth="2" opacity="0.3" />
                        <circle cx="35" cy="22" r="4" fill="white" opacity="0.8" />
                    </g>
                )}
            </g>
        </svg>
    );
}
