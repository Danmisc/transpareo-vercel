"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type CatTraits = {
    background: "blue" | "green" | "orange" | "purple" | "yellow" | "zinc" | "galaxy" | "forest" | "sunset" | "disco" | "cherry" | "sky";
    skin: "orange" | "black" | "white" | "grey" | "tabby" | "siamese" | "calico" | "tuxedo";
    eyes: "normal" | "happy" | "cool" | "winking" | "surprised" | "sleepy" | "starry" | "hearts";
    mouth: "smile" | "toungue" | "neutral" | "open" | "frown" | "smirk";
    clothing: "none" | "suit" | "hoodie" | "shirt" | "bowtie" | "kimono" | "space_suit" | "ninja" | "wizard" | "pirate" | "overalls" | "dress";
    hat: "none" | "cap" | "party" | "headphones" | "crown" | "helmet" | "wizard_hat" | "pirate_hat" | "viking" | "beret" | "flower" | "cowboy";
    accessory: "none" | "glasses" | "scarf" | "laptop" | "eyepatch" | "monocle" | "gold_chain" | "mask";
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

    // Enhanced Skin Colors with gradients
    type SkinColor = { base: string; shadow: string; stripe: string; secondary?: string; light?: string };
    const skinColors: Record<string, SkinColor> = {
        orange: { base: "#FFA061", shadow: "#E67E45", stripe: "#CC6A36", light: "#FFB080" },
        black: { base: "#374151", shadow: "#1F2937", stripe: "#111827", light: "#4B5563" },
        white: { base: "#F9FAFB", shadow: "#E5E7EB", stripe: "#F3F4F6", light: "#FFFFFF" },
        grey: { base: "#9CA3AF", shadow: "#6B7280", stripe: "#4B5563", light: "#D1D5DB" },
        tabby: { base: "#D6C0B0", shadow: "#BAA698", stripe: "#5D4E46", light: "#E5D0C0" },
        siamese: { base: "#F0EAD6", shadow: "#E6E6C5", stripe: "#4A3B32", secondary: "#3E2C22" },
        calico: { base: "#FFFFFF", shadow: "#F3F4F6", stripe: "#1F2937", secondary: "#EA580C" },
        tuxedo: { base: "#1F2937", shadow: "#111827", stripe: "#FFFFFF", secondary: "#FFFFFF" }
    };

    const c = skinColors[skin] || skinColors.orange;

    // Background Gradient Definitions
    const bgGradients: Record<string, [string, string]> = {
        blue: ["#DBEAFE", "#3B82F6"],
        green: ["#DCFCE7", "#22C55E"],
        orange: ["#FFEDD5", "#F97316"],
        purple: ["#F3E8FF", "#A855F7"],
        yellow: ["#FEF9C3", "#EAB308"],
        zinc: ["#F4F4F5", "#71717A"],
        galaxy: ["#1e1b4b", "#4c1d95"],
        forest: ["#14532D", "#166534"],
        sunset: ["#C2410C", "#FDBA74"],
        disco: ["#831843", "#DB2777"],
        cherry: ["#FCE7F3", "#F472B6"],
        sky: ["#BAE6FD", "#0EA5E9"],
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
                {/* Global Gradients */}
                <linearGradient id={`bg-${background}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={bgGradients[background][0]} />
                    <stop offset="100%" stopColor={bgGradients[background] ? bgGradients[background][1] : bgGradients[background][0]} />
                </linearGradient>

                {/* Lighting Filter */}
                <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Specific Gold Gradient */}
                <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                </linearGradient>

                {/* Lens Gradient */}
                <linearGradient id="lens-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#111827" />
                </linearGradient>
            </defs>

            {/* --- BACKGROUND LAYER --- */}
            <circle cx="100" cy="100" r="100" fill={`url(#bg-${background})`} />

            {/* Pattern Overlay */}
            <g opacity="0.3">
                {background === 'galaxy' && (
                    <g fill="white">
                        <circle cx="50" cy="40" r="1.5" /> <circle cx="150" cy="30" r="2" />
                        <path d="M100 50 L102 55 L107 57 L102 59 L100 64 L98 59 L93 57 L98 55 Z" fill="white" opacity="0.8" />
                    </g>
                )}
                {background === 'forest' && (
                    <g fill="#064E3B" opacity="0.2">
                        <path d="M20 120 L30 100 L40 120 Z" transform="translate(0, 0)" />
                        <path d="M160 140 L170 120 L180 140 Z" transform="translate(0, 0)" />
                    </g>
                )}
                {background === 'disco' && (
                    <g>
                        <circle cx="50" cy="50" r="10" fill="white" opacity="0.2" />
                        <circle cx="150" cy="150" r="15" fill="white" opacity="0.1" />
                    </g>
                )}
                {/* Standard subtle dots for others */}
                {['blue', 'green', 'orange', 'purple', 'yellow', 'zinc', 'sky', 'cherry', 'sunset'].includes(background) && (
                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="white" opacity="0.5" />
                    </pattern>
                )}
                {['blue', 'green', 'orange', 'purple', 'yellow', 'zinc', 'sky', 'cherry', 'sunset'].includes(background) && (
                    <rect x="0" y="0" width="200" height="200" fill="url(#dots)" />
                )}
            </g>


            {/* --- AVATAR GROUP (CENTERED) --- */}
            {/* Shifted down slightly to center the "Bean" ideally */}
            <g transform="translate(100, 120)">

                {/* 1. BODY LAYER */}
                <g filter="url(#soft-shadow)">
                    {/* BASE BODY - Always render passing prop c.base unless suit covers all */}
                    {clothing === "none" && (
                        <g>
                            <path d="M-35 25 Q-55 70 -45 105 L45 105 Q55 70 35 25 Q0 15 -35 25" fill={c.base} stroke="#18181B" strokeWidth="3" />
                            {/* Belly markings */}
                            {(skin === "tabby" || skin === "tuxedo" || skin === "orange" || skin === "grey") && (
                                <path d="M-20 60 Q0 55 20 60 L18 90 Q0 95 -18 90 Z" fill={skin === "tuxedo" ? "white" : "#FFFFFF"} opacity={skin === "tuxedo" ? 1 : 0.3} />
                            )}
                        </g>
                    )}

                    {/* BOWTIE - Implies Naked Body */}
                    {/* BOWTIE - V3: Polka Dot Fun */}
                    {clothing === "bowtie" && (
                        <g>
                            {/* Naked Body Base */}
                            <path d="M-35 25 Q-55 70 -45 105 L45 105 Q55 70 35 25 Q0 15 -35 25" fill={c.base} stroke="#18181B" strokeWidth="3" />
                            {(skin === "tabby" || skin === "tuxedo" || skin === "orange" || skin === "grey") && (
                                <path d="M-20 60 Q0 55 20 60 L18 90 Q0 95 -18 90 Z" fill={skin === "tuxedo" ? "white" : "#FFFFFF"} opacity={skin === "tuxedo" ? 1 : 0.3} />
                            )}

                            {/* Polka Dot Bowtie */}
                            <g transform="translate(0, 38)">
                                {/* Left Wing */}
                                <path d="M-2 0 Q-15 -10 -20 -5 L-20 5 Q-15 10 -2 0" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                                <circle cx="-12" cy="-2" r="1.5" fill="white" />
                                <circle cx="-16" cy="2" r="1.5" fill="white" />
                                <circle cx="-8" cy="2" r="1.5" fill="white" />

                                {/* Right Wing */}
                                <path d="M2 0 Q15 -10 20 -5 L20 5 Q15 10 2 0" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                                <circle cx="12" cy="-2" r="1.5" fill="white" />
                                <circle cx="16" cy="2" r="1.5" fill="white" />
                                <circle cx="8" cy="2" r="1.5" fill="white" />

                                {/* Center Knot */}
                                <circle cx="0" cy="0" r="4" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1" />
                            </g>
                        </g>
                    )}

                    {/* SUIT - V3: "James Bond" Tuxedo - High fidelity */}
                    {clothing === "suit" && (
                        <g>
                            {/* Jacket Base */}
                            <path d="M-40 25 Q-60 70 -50 110 L50 110 Q60 70 40 25 Q0 15 -40 25" fill="#111827" stroke="#000" strokeWidth="2" />

                            {/* Shirt Area - Pleated */}
                            <path d="M0 25 L-20 110 L20 110 L0 25" fill="white" />
                            <line x1="-5" y1="40" x2="-5" y2="110" stroke="#E5E7EB" strokeWidth="1" />
                            <line x1="5" y1="40" x2="5" y2="110" stroke="#E5E7EB" strokeWidth="1" />

                            {/* Satin Lapels */}
                            <path d="M-40 25 L-15 75 L-20 25" fill="#374151" /> {/* Left */}
                            <path d="M40 25 L15 75 L20 25" fill="#374151" />   {/* Right */}

                            {/* Buttons */}
                            <circle cx="0" cy="60" r="2" fill="#1F2937" />
                            <circle cx="0" cy="75" r="2" fill="#1F2937" />
                            <circle cx="0" cy="90" r="2" fill="#1F2937" />

                            {/* Red Silk Bow Tie */}
                            <path d="M-10 35 L0 40 L-10 45 L-10 35 Z" fill="#DC2626" />
                            <path d="M10 35 L0 40 L10 45 L10 35 Z" fill="#DC2626" />
                            <circle cx="0" cy="40" r="3" fill="#B91C1C" />

                            {/* Pocket Square */}
                            <path d="M30 45 L42 45 L30 55" fill="#DC2626" />
                        </g>
                    )}

                    {/* HOODIE - V9: "Varsity Legend" Vintage Sport */}
                    {clothing === "hoodie" && (
                        <g>
                            {/* Torso - Deep Burgundy */}
                            <path d="M-20 25 L-25 110 L25 110 L20 25" fill="#7F1D1D" stroke="#450A0A" strokeWidth="2" />
                            <path d="M-38 25 Q0 35 38 25" fill="#7F1D1D" stroke="#450A0A" strokeWidth="2" /> {/* Shoulder line */}

                            {/* Sleeves - Cream / Off-White (Varsity Style) */}
                            <path d="M-38 25 Q-60 60 -50 105 L-25 105" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
                            <path d="M38 25 Q60 60 50 105 L25 105" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />

                            {/* Cuffs - Striped */}
                            <path d="M-50 95 L-25 95" stroke="#7F1D1D" strokeWidth="2" />
                            <path d="M-50 100 L-25 100" stroke="#7F1D1D" strokeWidth="2" />
                            <path d="M50 95 L25 95" stroke="#7F1D1D" strokeWidth="2" />
                            <path d="M50 100 L25 100" stroke="#7F1D1D" strokeWidth="2" />

                            {/* Hood - Burgundy (Down) */}
                            <path d="M-35 25 Q0 45 35 25" fill="#991B1B" stroke="#450A0A" strokeWidth="1" />

                            {/* Letterman Patch "C" */}
                            <path d="M-10 60 Q-15 60 -15 70 Q-15 80 -10 80 L-5 80 L-5 75 L-10 75 Q-12 75 -12 70 Q-12 65 -10 65 L-5 65 L-5 60 Z" fill="#FCD34D" stroke="#B45309" strokeWidth="1" />

                            {/* Kangaroo Pocket */}
                            <path d="M-20 85 L20 85 L18 110 L-18 110 Z" fill="#991B1B" stroke="#450A0A" strokeWidth="1" />

                            {/* Drawstrings - Crisp White */}
                            <line x1="-10" y1="40" x2="-10" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <line x1="10" y1="40" x2="10" y2="70" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </g>
                    )}

                    {/* SHIRT - RESTORED */}
                    {/* SHIRT - V3: Hawaiian Aloha Shirt */}
                    {/* SHIRT - V4: Cool Denim Jacket */}
                    {clothing === "shirt" && (
                        <g>
                            {/* Inner White Tee */}
                            <path d="M-20 25 L-25 35 L0 45 L25 35 L20 25" fill="white" />

                            {/* Denim Jacket Base */}
                            <path d="M-38 25 Q-58 70 -48 105 L48 105 Q58 70 38 25 Q0 15 -38 25" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="2" />

                            {/* Open Front */}
                            <path d="M-15 25 L-15 105 L15 105 L15 25" fill="#1E3A8A" opacity="0.3" /> {/* Shadow inside */}
                            <path d="M-15 25 L-15 105" stroke="#1E3A8A" strokeWidth="1" />
                            <path d="M15 25 L15 105" stroke="#1E3A8A" strokeWidth="1" />

                            {/* Gold Stitching */}
                            <path d="M-38 25 L-15 65" stroke="#FCD34D" strokeWidth="1" strokeDasharray="2 2" />
                            <path d="M38 25 L15 65" stroke="#FCD34D" strokeWidth="1" strokeDasharray="2 2" />
                            <path d="M-40 100 L40 100" stroke="#FCD34D" strokeWidth="1" strokeDasharray="3 3" />

                            {/* Collar */}
                            <path d="M-38 25 L-15 40 L-15 25" fill="#1E40AF" stroke="#FCD34D" strokeWidth="1" />
                            <path d="M38 25 L15 40 L15 25" fill="#1E40AF" stroke="#FCD34D" strokeWidth="1" />

                            {/* Buttons */}
                            <circle cx="-20" cy="50" r="2.5" fill="#B45309" stroke="#78350F" />
                            <circle cx="20" cy="50" r="2.5" fill="#B45309" stroke="#78350F" />
                            <circle cx="-15" cy="80" r="2" fill="#B45309" />
                            <circle cx="15" cy="80" r="2" fill="#B45309" />
                        </g>
                    )}

                    {/* KIMONO - V4: Traditional Masterpiece */}
                    {clothing === "kimono" && (
                        <g>
                            {/* Base Robe - Deep Red with Pattern */}
                            <path d="M-40 25 Q-60 70 -50 110 L50 110 Q60 70 40 25 Q0 15 -40 25" fill="#BE185D" stroke="#9F1239" strokeWidth="2" />

                            {/* Seigaiha (Wave) Pattern Overlay */}
                            <defs>
                                <pattern id="seigaiha" x="0" y="0" width="10" height="5" patternUnits="userSpaceOnUse">
                                    <circle cx="5" cy="5" r="4" fill="none" stroke="#FCE7F3" strokeWidth="0.5" opacity="0.3" />
                                </pattern>
                            </defs>
                            <path d="M-38 25 Q-58 70 -48 108 L48 108 Q58 70 38 25 Q0 15 -38 25" fill="url(#seigaiha)" opacity="0.5" />

                            {/* Collar Layers */}
                            <path d="M-38 25 L38 90 L38 25" fill="#BE185D" /> {/* Right Fold */}
                            <path d="M38 25 L-38 95" stroke="#FFFFFF" strokeWidth="6" /> {/* Inner White Collar */}
                            <path d="M38 25 L-38 95" stroke="#9F1239" strokeWidth="3" /> {/* Outer Collar */}

                            {/* Obi (Belt) - Detailed Gold */}
                            <rect x="-42" y="65" width="84" height="20" fill="#FCD34D" stroke="#B45309" strokeWidth="1" />
                            <path d="M-42 68 L42 68" stroke="#F59E0B" strokeWidth="1" />
                            <path d="M-42 82 L42 82" stroke="#F59E0B" strokeWidth="1" />

                            {/* Obijime (Cord) */}
                            <path d="M-42 75 L42 75" stroke="#B91C1C" strokeWidth="2" />
                            <circle cx="0" cy="75" r="3" fill="#B91C1C" stroke="#7F1D1D" /> {/* Ornamental Knot */}
                        </g>
                    )}

                    {/* SPACE SUIT */}
                    {clothing === "space_suit" && (
                        <g>
                            <path d="M-40 25 Q-60 70 -50 105 L50 105 Q60 70 40 25 Q0 15 -40 25" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
                            <rect x="-20" y="50" width="40" height="25" rx="5" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
                            <circle cx="-8" cy="62" r="4" fill="#EF4444" />
                            <circle cx="8" cy="62" r="4" fill="#3B82F6" />
                            {/* Arm Details */}
                            <path d="M-45 50 L-35 50" stroke="#64748B" strokeWidth="2" />
                            <path d="M45 50 L35 50" stroke="#64748B" strokeWidth="2" />
                        </g>
                    )}

                    {/* NINJA - V4: Tactical Stealth Gear */}
                    {clothing === "ninja" && (
                        <g>
                            {/* Base Suit - Matte Black */}
                            <path d="M-38 25 Q-58 70 -48 110 L48 110 Q58 70 38 25 Q0 15 -38 25" fill="#171717" stroke="#000" strokeWidth="2" />

                            {/* Mesh Undershirt Detail (Neck) */}
                            <path d="M-15 25 L0 35 L15 25" fill="#262626" />
                            <path d="M-15 25 L15 25" stroke="#404040" strokeWidth="0.5" strokeDasharray="1 1" />

                            {/* Armor Panels */}
                            <path d="M-38 25 L-20 80 L-25 25" fill="#262626" opacity="0.6" /> {/* Shoulder L */}
                            <path d="M38 25 L20 80 L25 25" fill="#262626" opacity="0.6" />   {/* Shoulder R */}

                            {/* Red Scarf/Sash showing */}
                            <path d="M-20 25 Q0 30 20 25" fill="none" stroke="#DC2626" strokeWidth="2" />

                            {/* Utility Belt */}
                            <rect x="-40" y="75" width="80" height="12" fill="#4B5563" stroke="#1F2937" />
                            <rect x="-10" y="73" width="20" height="16" rx="2" fill="#374151" stroke="#9CA3AF" /> {/* Buckle Plate */}
                            <circle cx="0" cy="81" r="3" fill="#DC2626" /> {/* Symbol */}

                            {/* Kunai/Weapon Handles sticking out */}
                            <path d="M-30 75 L-35 60 L-32 75" fill="#D4D4D8" stroke="#52525B" />
                            <path d="M30 75 L35 60 L32 75" fill="#D4D4D8" stroke="#52525B" />
                        </g>
                    )}

                    {/* WIZARD ROBE - V6: "Merlin Supreme" Optimized */}
                    {clothing === "wizard" && (
                        <g>
                            {/* Base Robe - Deep Royal Blue */}
                            <path d="M-42 25 Q-65 70 -55 110 L55 110 Q65 70 42 25 Q0 15 -42 25" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2" />

                            {/* Layered Sleeves (Inner & Outer) */}
                            <path d="M-42 25 L-58 70 L-40 68 L-25 75 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1" /> {/* L */}
                            <path d="M42 25 L58 70 L40 68 L25 75 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1" />  {/* R */}

                            {/* Celestial Pattern - Gold & Silver */}
                            <path d="M-20 85 C-30 85 -30 70 -20 70 C-25 70 -25 85 -20 85" fill="#FCD34D" /> {/* Moon Shape */}
                            <path d="M25 55 L27 50 L29 55 L34 57 L29 59 L27 64 L25 59 L20 57 Z" fill="#FCD34D" /> {/* Star Big */}
                            <circle cx="-35" cy="55" r="1.5" fill="white" opacity="0.8" />
                            <circle cx="10" cy="95" r="1.5" fill="white" opacity="0.8" />
                            <circle cx="40" cy="85" r="1" fill="white" opacity="0.6" />

                            {/* Detailed Rope Belt with Knot */}
                            <path d="M-35 68 Q0 78 35 68" fill="none" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" />
                            <path d="M-35 68 Q0 78 35 68" fill="none" stroke="#D97706" strokeWidth="0.5" strokeDasharray="2 2" /> {/* Twist detail */}

                            <g transform="translate(0, 75)">
                                <circle cx="0" cy="0" r="4" fill="#FEF08A" stroke="#D97706" strokeWidth="1" /> {/* Knot */}
                                <path d="M-2 2 L-8 15" stroke="#FEF08A" strokeWidth="2" />
                                <path d="M2 2 L8 15" stroke="#FEF08A" strokeWidth="2" />
                                <circle cx="-8" cy="15" r="1.5" fill="#D97706" /> {/* Tassel L */}
                                <circle cx="8" cy="15" r="1.5" fill="#D97706" />  {/* Tassel R */}
                            </g>
                        </g>
                    )}

                    {/* OVERALLS - V4: "Hipster" Streetwear */}
                    {clothing === "overalls" && (
                        <g>
                            {/* Undershirt - Red/Black Flannel Plaid */}
                            <defs>
                                <pattern id="plaid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <rect width="10" height="10" fill="#DC2626" />
                                    <path d="M0 5 L10 5" stroke="#7F1D1D" strokeWidth="4" opacity="0.6" />
                                    <path d="M5 0 L5 10" stroke="#7F1D1D" strokeWidth="4" opacity="0.6" />
                                </pattern>
                            </defs>
                            <path d="M-38 25 Q-58 70 -48 105 L48 105 Q58 70 38 25 Q0 15 -38 25" fill="url(#plaid)" stroke="#7F1D1D" strokeWidth="1" />

                            {/* Denim Overalls - Vintage Wash */}
                            <path d="M-36 60 L-38 100 L38 100 L36 60 Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" /> {/* Pants */}
                            <rect x="-24" y="55" width="48" height="30" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" /> {/* Bib */}

                            {/* Rolled Cuffs */}
                            <rect x="-38" y="95" width="18" height="8" rx="2" fill="#93C5FD" stroke="#2563EB" />
                            <rect x="20" y="95" width="18" height="8" rx="2" fill="#93C5FD" stroke="#2563EB" />

                            {/* Straps - One undone! (Left attached, Right loose) */}
                            <path d="M-28 55 L-35 25 L-20 25 L-18 55" fill="#60A5FA" stroke="#2563EB" strokeWidth="1" /> {/* Left OK */}

                            {/* Right Strap Falling Down */}
                            <path d="M36 60 Q45 80 48 90" fill="none" stroke="#60A5FA" strokeWidth="5" strokeLinecap="round" />
                            <path d="M36 60 Q45 80 48 90" fill="none" stroke="#2563EB" strokeWidth="1" />

                            {/* Hardware */}
                            <circle cx="-28" cy="55" r="3" fill="#FCD34D" stroke="#B45309" /> {/* Left Button */}
                            <circle cx="48" cy="90" r="3" fill="#FCD34D" stroke="#B45309" /> {/* Right Button on loose strap */}

                            {/* Patches and Details */}
                            <rect x="-10" y="65" width="20" height="12" fill="#93C5FD" stroke="#2563EB" strokeWidth="1" strokeDasharray="2 1" /> {/* Pocket */}
                            <circle cx="-5" cy="70" r="2" fill="#10B981" /> {/* Pin/Badge */}
                        </g>
                    )}

                    {/* DRESS - V4: Cottagecore / Heidi Dress */}
                    {/* DRESS - V7: "Mod Chic" Minimalist Pink */}
                    {clothing === "dress" && (
                        <g>
                            {/* Base Dress - Clean Pink Silhouette */}
                            <path d="M-36 25 Q-55 70 -50 105 L50 105 Q55 70 36 25 Q0 15 -36 25" fill="#EC4899" stroke="#BE185D" strokeWidth="2" />

                            {/* Peter Pan Collar - Clean White Rounded */}
                            <path d="M-15 25 Q-20 40 0 45 Q20 40 15 25" fill="white" stroke="#E5E7EB" strokeWidth="1" />

                            {/* Decorative Buttons - Large & Simple */}
                            <circle cx="0" cy="55" r="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                            <circle cx="0" cy="70" r="4" fill="white" stroke="#E5E7EB" strokeWidth="1" />

                            {/* Crisp Hemline */}
                            <path d="M-50 105 L50 105" stroke="#BE185D" strokeWidth="2" />

                            {/* Minimalist Sleeves */}
                            <path d="M-36 25 L-42 40 L-30 42" fill="#EC4899" stroke="#BE185D" strokeWidth="2" />
                            <path d="M36 25 L42 40 L30 42" fill="#EC4899" stroke="#BE185D" strokeWidth="2" />
                        </g>
                    )}

                    {/* PIRATE - V3: The Captain's Coat */}
                    {clothing === "pirate" && (
                        <g>
                            {/* Deep Red Coat */}
                            <path d="M-40 25 Q-65 70 -50 110 L50 110 Q65 70 40 25 Q0 15 -40 25" fill="#7F1D1D" stroke="#450A0A" strokeWidth="2" />

                            {/* Gold Trim */}
                            <path d="M-40 25 L-40 110" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4 2" />
                            <path d="M40 25 L40 110" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4 2" />

                            {/* Striped Sash */}
                            <path d="M-45 65 L45 85 L45 100 L-45 80 Z" fill="#1F2937" />
                            <path d="M-45 70 L45 90" stroke="#4B5563" strokeWidth="2" />

                            {/* Inner Shirt (Breton Stripe) */}
                            <path d="M0 25 L-15 110 L15 110 L0 25" fill="white" />
                            <path d="M-5 40 L5 40" stroke="#1F2937" strokeWidth="2" />
                            <path d="M-8 55 L8 55" stroke="#1F2937" strokeWidth="2" />

                            {/* Gold Buttons */}
                            <circle cx="-25" cy="50" r="3" fill="#FCD34D" stroke="#B45309" />
                            <circle cx="25" cy="50" r="3" fill="#FCD34D" stroke="#B45309" />
                            <circle cx="-25" cy="70" r="3" fill="#FCD34D" stroke="#B45309" />
                            <circle cx="25" cy="70" r="3" fill="#FCD34D" stroke="#B45309" />
                        </g>
                    )}
                </g>

                {/* 2. HEAD LAYER (On top of body) */}
                <g transform="translate(0, -32)">
                    {/* Head Shadow on Neck */}
                    <ellipse cx="0" cy="45" rx="25" ry="8" fill="#000" opacity="0.2" />

                    <g filter="url(#soft-shadow)">
                        {/* EARS */}
                        <path d="M-40 -35 L-48 -60 L-18 -45 Z" fill={c.secondary || c.base} stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M40 -35 L48 -60 L18 -45 Z" fill={c.secondary || c.base} stroke="#18181B" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M-38 -38 L-42 -52 L-24 -43 Z" fill="#FDA4AF" />
                        <path d="M38 -38 L42 -52 L24 -43 Z" fill="#FDA4AF" />

                        {/* HEAD BASE */}
                        <rect x="-58" y="-45" width="116" height="90" rx="45" fill={c.base} stroke="#18181B" strokeWidth="3" />

                        {/* PATTERNS */}
                        {skin === "siamese" && (
                            <ellipse cx="0" cy="10" rx="20" ry="12" fill={c.secondary} opacity="0.8" filter="blur(5px)" />
                        )}
                        {skin === "calico" && (
                            <g>
                                {/* Calico V8: "Soft & Cute" - Large, round, pleasing shapes */}
                                <defs>
                                    <clipPath id="calico-clip-head-v8">
                                        <rect x="-58" y="-45" width="116" height="90" rx="45" />
                                    </clipPath>
                                </defs>
                                <g clipPath="url(#calico-clip-head-v8)">
                                    {/* 1. Base is White */}

                                    {/* 2. Large Soft Grey Patch (Top Left) */}
                                    <path d="M-60 -20 
                                             Q -40 0 -20 -30 
                                             Q -10 -50 -30 -60 
                                             L -60 -60 Z"
                                        fill="#1F2937" />

                                    {/* 3. Large Soft Orange Patch (Right Side) */}
                                    <path d="M60 -40
                                             Q 30 -30 30 0
                                             Q 30 30 60 40
                                             L 60 -40 Z"
                                        fill="#EA580C" />

                                    {/* 4. Cute circular Beauty Spot (Left Chin) */}
                                    <circle cx="-30" cy="30" r="12" fill="#EA580C" opacity="0.9" />
                                </g>
                            </g>
                        )}
                        {skin === "tuxedo" && (
                            <g>
                                {/* Tuxedo V9: "Sharp & Stylish" - Classic Batman/Sylvester look */}
                                <defs>
                                    <clipPath id="tuxedo-clip-v9">
                                        <rect x="-58" y="-45" width="116" height="90" rx="45" />
                                    </clipPath>
                                </defs>
                                <g clipPath="url(#tuxedo-clip-v9)">
                                    {/* 1. Black Base */}
                                    <rect x="-60" y="-50" width="120" height="100" fill="#1F2937" />

                                    {/* 2. White Face (Sharp Triangle/Diamond Blaze) */}
                                    {/* Designed to be sharp and elegant */}
                                    <path d="M0 -30
                                             L -15 0 
                                             L -35 15
                                             Q -45 35 -20 50
                                             L 20 50
                                             Q 45 35 35 15
                                             L 15 0
                                             L 0 -30 Z"
                                        fill="white" />

                                    {/* 3. Pink Nose Highlight */}
                                    <circle cx="0" cy="25" r="3" fill="#F472B6" opacity="0.8" />
                                </g>
                            </g>
                        )}

                        {/* STRIPES */}
                        {(skin !== "tuxedo") && ( /* Hide stripes on Tuxedo for cleaner look */
                            <g opacity="0.7">
                                <path d="M0 -45 L0 -30" stroke={c.stripe} strokeWidth="4" strokeLinecap="round" />
                                <path d="M-20 -42 L-20 -32" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                                <path d="M20 -42 L20 -32" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                                <path d="M-58 0 L-45 0" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                                <path d="M58 0 L45 0" stroke={c.stripe} strokeWidth="3" strokeLinecap="round" />
                            </g>
                        )}

                        {/* CHEEKS */}
                        <circle cx="-38" cy="15" r="8" fill="#FDA4AF" opacity="0.3" />
                        <circle cx="38" cy="15" r="8" fill="#FDA4AF" opacity="0.3" />

                        {/* --- FACE FEATURES --- */}
                        <g transform="translate(0, 5)">
                            {/* MOUTH & NOSE */}
                            <g transform="translate(0, 12)">
                                <path d="M-4 -5 Q0 -2 4 -5 L0 -1 Z" fill="#FDA4AF" stroke="none" /> {/* Nose */}

                                {mouth === "smile" && <path d="M-7 4 Q0 9 7 4" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />}
                                {mouth === "toungue" && (
                                    <g>
                                        <path d="M-7 4 Q0 9 7 4" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M-3 6 Q0 10 3 6" fill="#FDA4AF" stroke="#18181B" strokeWidth="1" />
                                    </g>
                                )}
                                {mouth === "neutral" && <path d="M-5 6 L5 6" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />}
                                {mouth === "open" && <circle cx="0" cy="5" r="3" fill="#18181B" />}
                                {mouth === "frown" && <path d="M-7 8 Q0 3 7 8" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />}
                                {mouth === "smirk" && <path d="M-7 6 Q0 8 7 4" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />}
                            </g>

                            {/* EYES */}
                            <g transform="translate(0, 0)">
                                {eyes === "normal" && (
                                    <g>
                                        <circle cx="-24" cy="0" r="9" fill="#18181B" />
                                        <circle cx="24" cy="0" r="9" fill="#18181B" />
                                        <circle cx="-20" cy="-3" r="3" fill="white" />
                                        <circle cx="28" cy="-3" r="3" fill="white" />
                                    </g>
                                )}
                                {eyes === "happy" && (
                                    <g>
                                        <path d="M-32 2 Q-24 -6 -16 2" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
                                        <path d="M16 2 Q24 -6 32 2" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
                                    </g>
                                )}
                                {eyes === "winking" && (
                                    <g>
                                        <circle cx="-24" cy="0" r="9" fill="#18181B" />
                                        <circle cx="-20" cy="-3" r="3" fill="white" />
                                        <path d="M16 2 Q24 -6 32 2" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
                                    </g>
                                )}
                                {eyes === "surprised" && (
                                    <g>
                                        <circle cx="-24" cy="0" r="10" fill="#18181B" />
                                        <circle cx="24" cy="0" r="10" fill="#18181B" />
                                        <circle cx="-20" cy="-3" r="3" fill="white" />
                                        <circle cx="28" cy="-3" r="3" fill="white" />
                                        <path d="M-32 -14 Q-24 -20 -16 -14" fill="none" stroke="#18181B" strokeWidth="1.5" />
                                        <path d="M16 -14 Q24 -20 32 -14" fill="none" stroke="#18181B" strokeWidth="1.5" />
                                    </g>
                                )}
                                {eyes === "sleepy" && (
                                    <g>
                                        {/* Sleepy V2: Anime style cute sleeping face */}
                                        {/* Left Eye - Soft downward curve with lashes */}
                                        <path d="M-35 0 Q-24 8 -13 0" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M-35 0 L-37 -3" stroke="#18181B" strokeWidth="2" strokeLinecap="round" /> {/* Lash 1 */}
                                        <path d="M-24 4 L-24 1" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />  {/* Lash 2 */}
                                        <path d="M-13 0 L-11 -3" stroke="#18181B" strokeWidth="2" strokeLinecap="round" /> {/* Lash 3 */}

                                        {/* Right Eye */}
                                        <path d="M13 0 Q24 8 35 0" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M13 0 L11 -3" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M24 4 L24 1" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M35 0 L37 -3" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

                                        {/* Snot Bubble (Anime trope) */}
                                        <circle cx="5" cy="5" r="7" fill="#93C5FD" opacity="0.4" stroke="#60A5FA" strokeWidth="1" />
                                        <circle cx="8" cy="3" r="1.5" fill="white" opacity="0.8" />

                                        {/* Stylized Zzz */}
                                        <g transform="translate(40, -15)">
                                            <path d="M0 0 L8 0 L0 8 L8 8" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M10 -12 L16 -12 L10 -6 L16 -6" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                    </g>
                                )}
                                {eyes === "starry" && (
                                    <g>
                                        {/* Starry V3: Galaxy Eyes - Deep and mesmerising */}
                                        <defs>
                                            <radialGradient id="galaxy-grad">
                                                <stop offset="0%" stopColor="#4C1D95" /> {/* Deep Purple */}
                                                <stop offset="70%" stopColor="#1E1B4B" /> {/* Midnight Blue */}
                                                <stop offset="100%" stopColor="#000000" />
                                            </radialGradient>
                                        </defs>

                                        {/* Left Eye */}
                                        <circle cx="-24" cy="0" r="11" fill="url(#galaxy-grad)" />
                                        {/* Main Sparkle */}
                                        <path d="M-24 -8 L-22 -2 L-16 -2 L-21 2 L-19 8 L-24 4 L-29 8 L-27 2 L-32 -2 L-26 -2 Z" fill="#FDE047" />
                                        {/* Tiny cosmic dots */}
                                        <circle cx="-28" cy="5" r="1.5" fill="#F472B6" />
                                        <circle cx="-18" cy="4" r="1" fill="#60A5FA" />

                                        {/* Right Eye */}
                                        <circle cx="24" cy="0" r="11" fill="url(#galaxy-grad)" />
                                        <path d="M24 -8 L26 -2 L32 -2 L27 2 L29 8 L24 4 L19 8 L21 2 L16 -2 L22 -2 Z" fill="#FDE047" />
                                        <circle cx="20" cy="5" r="1.5" fill="#F472B6" />
                                        <circle cx="30" cy="4" r="1" fill="#60A5FA" />
                                    </g>
                                )}
                                {eyes === "hearts" && (
                                    <g>
                                        <path d="M-24 2 Q-30 -5 -24 -10 Q-18 -5 -24 2" fill="#EF4444" stroke="#EF4444" strokeWidth="2" />
                                        <path d="M24 2 Q18 -5 24 -10 Q30 -5 24 2" fill="#EF4444" stroke="#EF4444" strokeWidth="2" />
                                    </g>
                                )}
                                {eyes === "cool" && (
                                    <g>
                                        {/* Wayfarer V3 - Perfected */}
                                        <path d="M-48 -10 Q-48 -20 -32 -20 L-16 -20 Q-6 -20 -6 -10 L-8 5 Q-16 14 -32 14 Q-46 14 -48 5 Z" fill="#111827" />
                                        <path d="M-44 -10 Q-44 -16 -32 -16 L-20 -16 Q-10 -16 -10 -10 L-12 2 Q-16 10 -32 10 Q-40 10 -42 2 Z" fill="url(#lens-grad)" />

                                        <path d="M48 -10 Q48 -20 32 -20 L16 -20 Q6 -20 6 -10 L8 5 Q16 14 32 14 Q46 14 48 5 Z" fill="#111827" />
                                        <path d="M44 -10 Q44 -16 32 -16 L20 -16 Q10 -16 10 -10 L12 2 Q16 10 32 10 Q40 10 42 2 Z" fill="url(#lens-grad)" />

                                        <path d="M-6 -10 Q0 -14 6 -10" fill="none" stroke="#111827" strokeWidth="3" />

                                        {/* Glossy Reflection */}
                                        <path d="M-40 -12 L-30 0" stroke="white" strokeWidth="2" opacity="0.4" />
                                        <path d="M30 -12 L40 0" stroke="white" strokeWidth="2" opacity="0.4" />
                                    </g>
                                )}
                            </g>
                        </g>

                        {/* ACCESSORIES ON FACE */}
                        {accessory === "glasses" && eyes !== "cool" && (
                            <g filter="url(#soft-shadow)">
                                <circle cx="-24" cy="0" r="16" fill="rgba(255,255,255,0.2)" stroke="#111827" strokeWidth="3" />
                                <circle cx="24" cy="0" r="16" fill="rgba(255,255,255,0.2)" stroke="#111827" strokeWidth="3" />
                                <path d="M-8 0 L8 0" stroke="#111827" strokeWidth="3" />
                                <path d="M-40 0 L-55 -10" stroke="#111827" strokeWidth="2" />
                                <path d="M40 0 L55 -10" stroke="#111827" strokeWidth="2" />
                            </g>
                        )}
                        {accessory === "eyepatch" && (
                            <g>
                                <path d="M-24 0 L-50 -20" stroke="#111827" strokeWidth="2.5" />
                                <path d="M-24 0 L4 -20" stroke="#111827" strokeWidth="2.5" />
                                <circle cx="-24" cy="0" r="15" fill="#000000" />
                                <path d="M-28 -5 L-20 5" stroke="white" opacity="0.1" strokeWidth="2" />
                            </g>
                        )}
                        {accessory === "monocle" && (
                            <g>
                                {/* Monocle: Centered perfectly on Right Eye (cx=24, cy=0) */}
                                <circle cx="24" cy="0" r="14" fill="rgba(255,255,255,0.15)" stroke="#F59E0B" strokeWidth="2" />
                                <circle cx="24" cy="0" r="14" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" /> {/* Glint */}

                                {/* Chain connecting to ear/cheek area */}
                                <path d="M38 0 Q45 10 45 35" stroke="#F59E0B" strokeWidth="1" fill="none" strokeDasharray="2 1" />
                            </g>
                        )}
                        {accessory === "mask" && (
                            <g>
                                {/* Mask V4: Side Bands - Tied behind head */}

                                {/* Straps - Horizontal trajectory */}
                                {/* Left Strap: Disappearing behind the cheek fluff */}
                                <path d="M-41 12 Q-50 15 -60 10" fill="none" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />
                                {/* Right Strap */}
                                <path d="M41 12 Q50 15 60 10" fill="none" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round" />

                                {/* Main Mask Body - Medical Blue */}
                                <path d="M-42 10 Q0 5 42 10 L38 45 Q0 50 -38 45 Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1" />

                                {/* Pleats / Folds - Softened for realism */}
                                <path d="M-40 20 Q0 15 40 20" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0.3" />
                                <path d="M-39 30 Q0 25 39 30" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0.3" />
                                <path d="M-38 40 Q0 35 38 40" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0.3" />

                                {/* Nose Wire Highlight */}
                                <path d="M-15 12 Q0 10 15 12" fill="none" stroke="white" strokeWidth="2" opacity="0.4" />
                            </g>
                        )}

                    </g>
                </g>

                {/* 3. HAT LAYER (Topmost) */}
                <g transform="translate(0, -65)" filter="url(#soft-shadow)">
                    {hat === "cap" && (
                        /* Cap: V3 "Pro Snapback" - Improved Perspective */
                        <g transform="translate(0, 0)">
                            {/* Crown (Back & Top) */}
                            <path d="M-38 0 Q-42 -35 0 -40 Q42 -35 38 0" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2" />

                            {/* Visor - 3D Perspective (Coming forward) */}
                            <path d="M-40 0 C-50 20 -20 28 0 28 C20 28 50 20 40 0" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2" /> {/* Top surface */}
                            <path d="M-40 0 Q0 8 40 0" fill="none" stroke="#1E3A8A" strokeWidth="1" /> {/* Brim crease */}

                            {/* Structured Panels */}
                            <path d="M0 -40 Q-8 -20 -5 0" fill="none" stroke="#1E40AF" strokeWidth="1" strokeDasharray="1 1" />
                            <path d="M0 -40 Q8 -20 5 0" fill="none" stroke="#1E40AF" strokeWidth="1" strokeDasharray="1 1" />
                            <circle cx="0" cy="-40" r="2.5" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="1" /> {/* Button */}

                            {/* Front Logo - 3D Embroidered Effect */}
                            <circle cx="0" cy="-15" r="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
                            <path d="M-3 -15 L3 -18 L3 -12 Z" fill="#EF4444" /> {/* Abstract logo shape */}
                            <circle cx="0" cy="-15" r="5" fill="none" stroke="#EF4444" strokeWidth="1" />

                            {/* Side Air Vents */}
                            <circle cx="-25" cy="-25" r="1.5" fill="#1E3A8A" opacity="0.6" />
                            <circle cx="25" cy="-25" r="1.5" fill="#1E3A8A" opacity="0.6" />
                        </g>
                    )}
                    {hat === "crown" && (
                        /* Crown: V4 "Minimalist Kingdom" - Clean & Bold */
                        <g transform="translate(0, -12)">
                            {/* Back part of the band (for depth) */}
                            <path d="M-28 15 L28 15 L28 10 L-28 10 Z" fill="#B45309" />

                            {/* Inner Cap - Royal Velvet */}
                            <path d="M-25 10 Q0 -15 25 10" fill="#991B1B" />

                            {/* Main Crowns Shape - Solid Gold */}
                            <path d="M-30 15 L-35 -10 L-18 5 L0 -25 L18 5 L35 -10 L30 15 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />

                            {/* Gems - Simple & Bold (No complex effects) */}
                            <rect x="-6" y="-6" width="12" height="12" rx="2" transform="rotate(45)" fill="#EF4444" stroke="#991B1B" strokeWidth="1" /> {/* Center Ruby */}
                            <circle cx="-25" cy="5" r="3" fill="#3B82F6" /> {/* Sapphire L */}
                            <circle cx="25" cy="5" r="3" fill="#3B82F6" />  {/* Sapphire R */}

                            {/* Tips - Clean Circles */}
                            <circle cx="0" cy="-25" r="3" fill="white" stroke="#B45309" strokeWidth="1" />
                            <circle cx="-35" cy="-10" r="2" fill="white" stroke="#B45309" strokeWidth="1" />
                            <circle cx="35" cy="-10" r="2" fill="white" stroke="#B45309" strokeWidth="1" />
                        </g>
                    )}
                    {hat === "party" && (
                        /* Party Hat: V2 - Adjusted Height (Lifted up) */
                        <g transform="rotate(-15) translate(-10, -32)">
                            {/* Cone Body - Festive Red */}
                            <path d="M-22 30 L0 -25 L22 30 Q0 35 -22 30" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />

                            {/* Pattern - Yellow ZigZags */}
                            <path d="M-12 5 L-8 0 L-4 5 L0 0 L4 5 L8 0 L12 5" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
                            <path d="M-18 20 L-14 15 L-10 20 L-6 15 L-2 20 L2 15 L6 20 L10 15 L14 20 L18 15" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />

                            {/* Pom Pom - Fluffy Yellow Cloud */}
                            <circle cx="0" cy="-25" r="6" fill="#FCD34D" />
                            <circle cx="-3" cy="-28" r="3" fill="#FEF3C7" />
                            <circle cx="3" cy="-28" r="3" fill="#F59E0B" opacity="0.5" />

                            {/* Rim Frill */}
                            <path d="M-22 30 Q-15 35 -10 30 T5 30 T22 30" fill="none" stroke="white" strokeWidth="2" strokeDasharray="2 1" />
                        </g>
                    )}
                    {hat === "helmet" && (
                        /* Helmet: V2 "Cosmic Explorer" - Detailed & Techy */
                        <g transform="translate(0, 20)">
                            {/* Inner "Snoopy Cap" (Hides Ears) */}
                            <path d="M-35 0 Q-35 -45 0 -45 Q35 -45 35 0 L35 20 Q35 40 0 40 Q-35 40 -35 20 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M-35 0 Q0 10 35 0" fill="none" stroke="#CBD5E1" strokeWidth="1" /> {/* Forehead seam */}

                            {/* Back of Helmet (behind head - outer shell) */}
                            <path d="M-55 0 Q-55 -55 0 -55 Q55 -55 55 0 L55 20 Q55 55 0 55 Q-55 55 -55 20 Z" fill="#1E293B" stroke="#334155" strokeWidth="2" />

                            {/* Glass Faceplate - Blue Tint */}
                            <path d="M-50 0 Q-50 -50 0 -50 Q50 -50 50 0 L50 20 Q50 50 0 50 Q-50 50 -50 20 Z" fill="#60A5FA" opacity="0.4" stroke="#93C5FD" strokeWidth="1" />

                            {/* Reflection on Glass */}
                            <path d="M-30 -35 Q-10 -45 10 -35" stroke="white" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
                            <circle cx="25" cy="-25" r="2" fill="white" opacity="0.6" />

                            {/* Metal Neck Ring */}
                            <path d="M-55 45 Q0 65 55 45 L55 55 Q0 75 -55 55 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
                            <rect x="-15" y="55" width="30" height="8" rx="2" fill="#64748B" /> {/* Front control panel */}
                            <circle cx="0" cy="59" r="2" fill="#22D3EE" /> {/* Power Light */}

                            {/* Side Ear Modules */}
                            <rect x="-62" y="-10" width="12" height="40" rx="4" fill="#64748B" stroke="#334155" strokeWidth="2" />
                            <rect x="50" y="-10" width="12" height="40" rx="4" fill="#64748B" stroke="#334155" strokeWidth="2" />

                            {/* Antenna */}
                            <line x1="56" y1="-10" x2="56" y2="-40" stroke="#64748B" strokeWidth="2" />
                            <circle cx="56" cy="-40" r="3" fill="#EF4444" stroke="#DC2626" />
                        </g>
                    )}
                    {hat === "headphones" && (
                        /* Headphones: V4 "Audiophile Elite" - Premium & Oval */
                        <g transform="translate(0, 10)">
                            {/* Headband Structure (Metal Core) */}
                            <path d="M-55 5 Q-55 -48 0 -48 Q55 -48 55 5" fill="none" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round" />

                            {/* Headband Cushion (Leather) */}
                            <path d="M-45 -10 Q0 -42 45 -10" fill="none" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />

                            {/* Sliders (Connecting band to cups) */}
                            <rect x="-58" y="-5" width="6" height="15" rx="2" fill="#9CA3AF" />
                            <rect x="52" y="-5" width="6" height="15" rx="2" fill="#9CA3AF" />

                            {/* Left Earcup - Oval High-Fidelity */}
                            <ellipse cx="-58" cy="15" rx="14" ry="22" fill="#111827" stroke="#374151" strokeWidth="2" />
                            <ellipse cx="-58" cy="15" rx="10" ry="16" fill="#1F2937" /> {/* Inner cup */}
                            <path d="M-60 10 L-56 20 M-64 15 L-52 15" stroke="#4B5563" strokeWidth="1" opacity="0.5" /> {/* Grill hint */}

                            {/* Right Earcup */}
                            <ellipse cx="58" cy="15" rx="14" ry="22" fill="#111827" stroke="#374151" strokeWidth="2" />
                            <ellipse cx="58" cy="15" rx="10" ry="16" fill="#1F2937" />
                            <path d="M60 10 L56 20 M64 15 L52 15" stroke="#4B5563" strokeWidth="1" opacity="0.5" />
                        </g>
                    )}
                    {hat === "wizard_hat" && (
                        /* Wizard Hat: V7 - Raised Position */
                        <g transform="translate(0, -15)">
                            <ellipse cx="0" cy="20" rx="60" ry="12" fill="#2E1065" />
                            <path d="M-40 20 Q-15 -75 0 -95 Q15 -75 40 20 Z" fill="#4C1D95" stroke="#2E1065" strokeWidth="2" />
                            <path d="M0 -50 L5 -40 L-5 -40 Z" fill="#FCD34D" transform="translate(0,0)" /> {/* Star */}
                            <path d="M-20 20 Q0 10 20 20" stroke="#2E1065" strokeWidth="2" fill="none" /> {/* Brim crease */}
                        </g>
                    )}
                    {hat === "pirate_hat" && (
                        /* Pirate Hat: V5 "Pirate Lord" - Optimized Fit & Geometry */
                        <g transform="translate(0, -8)">
                            {/* Inner Cap (Base) - Sits on head */}
                            <path d="M-30 0 Q0 -15 30 0 L30 -10 Q0 -45 -30 -10 Z" fill="#1F2937" stroke="#000" strokeWidth="1" />

                            {/* Feather - Clean single shape (Red) */}
                            <path d="M15 -15 Q30 -35 50 -30 Q55 -20 45 -10" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
                            <path d="M15 -15 Q35 -25 50 -30" fill="none" stroke="#7F1D1D" strokeWidth="1" opacity="0.5" />

                            {/* Hat Brim - Tricorne Shape (One continuous path) */}
                            <path d="M-60 0 Q-30 20 0 5 Q30 20 60 0 L50 -15 Q30 -40 0 -25 Q-30 -40 -50 -15 Z" fill="#111827" stroke="#000" strokeWidth="2" strokeLinejoin="round" />

                            {/* Gold Trim - Follows the brim */}
                            <path d="M-55 -2 Q-28 15 0 2 Q28 15 55 -2" fill="none" stroke="#F59E0B" strokeWidth="2" />

                            {/* Gold Button/Badge */}
                            <circle cx="15" cy="-12" r="4" fill="#FCD34D" stroke="#B45309" strokeWidth="1" />
                        </g>
                    )}
                    {hat === "viking" && (
                        /* Viking: V10 "Iron Will" - Clean, Hornless, Iconic */
                        <g transform="translate(0, -8)">
                            {/* Helmet Dome - Smooth gradient feel with simple stroke */}
                            <path d="M-40 0 Q0 -45 40 0 L40 5 Q0 -20 -40 5 Z" fill="#4B5563" stroke="#1F2937" strokeWidth="2" />

                            {/* Vertical Reinforcement Strip */}
                            <path d="M0 -45 L0 0" fill="none" stroke="#374151" strokeWidth="3" />
                            <circle cx="0" cy="-35" r="2" fill="#9CA3AF" />
                            <circle cx="0" cy="-15" r="2" fill="#9CA3AF" />

                            {/* Rim - Sturdy Iron */}
                            <path d="M-42 5 Q0 -15 42 5 L42 12 Q0 -8 -42 12 Z" fill="#6B7280" stroke="#374151" strokeWidth="2" />

                            {/* Simple Nasal Guard (No eye mask) */}
                            <path d="M-5 5 L-4 25 L0 30 L4 25 L5 5" fill="#6B7280" stroke="#374151" strokeWidth="2" />
                        </g>
                    )}
                    {hat === "beret" && (
                        /* Beret: V5 "Classic Tilt" - Tilted & Soft Draping */
                        <g transform="translate(18, -8) rotate(15)">
                            {/* Main Body - Smoother asymmetry */}
                            <path d="M-40 10 Q-55 -25 0 -22 Q60 -18 50 15 Q20 20 -40 10" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />

                            {/* The "Cabillou" - Angled with the hat */}
                            <path d="M0 -22 L3 -26 L6 -22" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" />

                            {/* Soft Drapery Lines - Showing fabric weight */}
                            <path d="M25 -15 Q45 -5 48 10" fill="none" stroke="#7F1D1D" strokeWidth="1" opacity="0.3" />
                            <path d="M-20 -18 Q-10 -10 -5 -5" fill="none" stroke="#7F1D1D" strokeWidth="1" opacity="0.2" />

                            {/* Base Band - Curved for fit */}
                            <path d="M-38 10 Q10 18 48 12" fill="none" stroke="#7F1D1D" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                        </g>
                    )}
                    {hat === "cowboy" && (
                        /* Cowboy: Wider brim */
                        <g transform="translate(0, -5)">
                            <ellipse cx="0" cy="15" rx="70" ry="12" fill="#92400E" stroke="#78350F" strokeWidth="2" />
                            <path d="M-30 15 Q-20 -45 0 -50 Q20 -45 30 15" fill="#92400E" stroke="#78350F" strokeWidth="2" />
                            <path d="M-28 12 Q0 20 28 12" fill="none" stroke="#78350F" strokeWidth="3" /> {/* Band */}
                            <path d="M0 -40 L0 -30" stroke="#78350F" strokeWidth="1" opacity="0.5" /> {/* Dent */}
                        </g>
                    )}
                    {hat === "flower" && (
                        /* Flower: V4 "Pure Plumeria" - Simple & Decorative */
                        <g transform="translate(24, -12) rotate(10)">
                            {/* Main 5-Petal Shape - Soft & Round */}
                            <path d="M0 0 Q-10 -15 0 -22 Q10 -15 0 0" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" transform="rotate(0)" />
                            <path d="M0 0 Q-10 -15 0 -22 Q10 -15 0 0" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" transform="rotate(72)" />
                            <path d="M0 0 Q-10 -15 0 -22 Q10 -15 0 0" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" transform="rotate(144)" />
                            <path d="M0 0 Q-10 -15 0 -22 Q10 -15 0 0" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" transform="rotate(216)" />
                            <path d="M0 0 Q-10 -15 0 -22 Q10 -15 0 0" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" transform="rotate(288)" />

                            {/* Center Gradient - Warm center */}
                            <circle cx="0" cy="0" r="4" fill="#F59E0B" opacity="0.8" />
                            <circle cx="0" cy="0" r="2" fill="#FCD34D" />
                        </g>
                    )}
                </g>

                {/* 4. NECK/BODY ACCESSORIES (On top of body, under head) - Scarf logic */}
                {accessory === "scarf" && (
                    <g transform="translate(0, 24)">
                        {/* Scarf: V12 "Optimized Snood" - Tighter & Higher Fit (Cache-cou) */}

                        {/* 1. Base roll (Darker, tighter) - Reduced width and stroke */}
                        <path d="M-36 0 Q0 20 36 0" fill="none" stroke="#B45309" strokeWidth="18" strokeLinecap="round" />

                        {/* 2. Top roll (Lighter, main volume) - Fits snugly under chin */}
                        <path d="M-34 -4 Q0 15 34 -4" fill="none" stroke="#D97706" strokeWidth="14" strokeLinecap="round" />

                        {/* 3. Highlight/Fold details */}
                        <path d="M-34 -4 Q0 15 34 -4" fill="none" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round" />

                        {/* Minimal fold lines for texture */}
                        <path d="M-15 4 Q0 10 15 4" fill="none" stroke="#D97706" strokeWidth="1.5" opacity="0.6" />
                        <path d="M-12 -2 Q0 3 12 -2" fill="none" stroke="#D97706" strokeWidth="1.5" opacity="0.6" />
                    </g>
                )}
                {accessory === "gold_chain" && (
                    <g transform="translate(0, 35)">
                        <path d="M-38 -5 Q0 40 38 -5" fill="none" stroke="#FCD34D" strokeWidth="6" strokeDasharray="3 1" filter="url(#soft-shadow)" />
                        <circle cx="0" cy="20" r="10" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                        <text x="0" y="24" textAnchor="middle" fontSize="12" fill="#B45309" fontWeight="bold" style={{ fontFamily: 'serif' }}>$</text>
                    </g>
                )}
                {accessory === "laptop" && (
                    <g transform="translate(0, 40)">
                        {/* Laptop V3: "Sleek Pro" - Minimalist Space Grey */}

                        {/* 1. Laptop Lid - Premium Dark Grey */}
                        <rect x="-60" y="0" width="120" height="75" rx="4" fill="#374151" stroke="#1F2937" strokeWidth="1" />

                        {/* 2. Top Edge Highlight (Slim profile) */}
                        <path d="M-58 2 L58 2" stroke="#4B5563" strokeWidth="1" opacity="0.5" />

                        {/* 3. Glowing Logo - Centered Simple Pear */}
                        {/* A clean, white glowing shape */}
                        <path d="M0 25 L-6 38 Q0 45 6 38 L0 25" fill="#FFFFFF" filter="url(#soft-shadow)" opacity="0.9" />
                        <circle cx="0" cy="30" r="8" fill="#FFFFFF" opacity="0.9" filter="url(#soft-shadow)" />

                        {/* 4. Soft Paws - Dynamic Color */}
                        <g transform="translate(0, -6)">
                            {/* Left Paw */}
                            <ellipse cx="-30" cy="6" rx="12" ry="7"
                                fill={skin === "tuxedo" ? "#FFFFFF" : c.base}
                                stroke={skin === "white" || skin === "tuxedo" ? "#D1D5DB" : "#1F2937"}
                                strokeWidth="1" />
                            <path d="M-30 6 L-30 10 M-35 5 L-35 9 M-25 5 L-25 9"
                                stroke={skin === "white" || skin === "tuxedo" ? "#E5E7EB" : "#1F2937"}
                                strokeWidth="1.5" />

                            {/* Right Paw */}
                            <ellipse cx="30" cy="6" rx="12" ry="7"
                                fill={skin === "tuxedo" ? "#FFFFFF" : c.base}
                                stroke={skin === "white" || skin === "tuxedo" ? "#D1D5DB" : "#1F2937"}
                                strokeWidth="1" />
                            <path d="M30 6 L30 10 M25 5 L25 9 M35 5 L35 9"
                                stroke={skin === "white" || skin === "tuxedo" ? "#E5E7EB" : "#1F2937"}
                                strokeWidth="1.5" />
                        </g>

                        {/* 5. Subtle Reflection/Sheen on the lid */}
                        <path d="M-50 10 L-40 60" stroke="#4B5563" strokeWidth="20" opacity="0.05" transform="skewX(-20)" />
                    </g>
                )}

            </g>
        </svg>
    );
}
