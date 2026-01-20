"use client";

import { motion } from "framer-motion";
import { UserRole } from "@/types/next-auth";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    role?: UserRole | null;
    showBackButton?: boolean;
}

export function AuthLayout({ children, title, subtitle, role, showBackButton = true }: AuthLayoutProps) {
    // Dynamic styles based on role
    const getRoleStyles = () => {
        switch (role) {
            case "OWNER":
                return {
                    bg: "bg-blue-900",
                    accent: "from-blue-600 to-indigo-900",
                    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop", // Modern building
                    quote: "Gérez votre patrimoine avec sérénité."
                };
            case "AGENCY":
                return {
                    bg: "bg-zinc-900",
                    accent: "from-zinc-800 to-black",
                    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop", // Modern office
                    quote: "L'excellence immobilière pour vos clients."
                };
            case "TENANT":
            default:
                return {
                    bg: "bg-orange-500",
                    accent: "from-orange-400 to-rose-500",
                    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop", // Cozy apartment
                    quote: "Trouvez le logement qui vous ressemble."
                };
        }
    };

    const styles = getRoleStyles();

    return (
        <div className="min-h-screen flex w-full bg-white dark:bg-black overflow-hidden">
            {/* LEFT SIDE: Visual & Brand */}
            <motion.div
                className={cn("hidden lg:flex w-1/2 relative overflow-hidden text-white flex-col justify-between p-12 transition-colors duration-700", styles.bg)}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Background Image / Gradient */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={styles.image}
                        alt="Background"
                        fill
                        className="object-cover opacity-40 mix-blend-overlay"
                        priority
                    />
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", styles.accent)} />
                </div>

                {/* Brand Logo */}
                <div className="relative z-10">
                    <Link href="/" className="text-3xl font-black tracking-tighter flex items-center gap-2">
                        Transpareo<span className="text-white/50">.</span>
                    </Link>
                </div>

                {/* Dynamic Quote & Video */}
                <div className="relative z-10 max-w-lg">
                    <motion.div
                        key={role || "default"}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-bold leading-tight mb-6">
                            "{styles.quote}"
                        </h2>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 relative overflow-hidden">
                                        <Image src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="User" fill />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-medium opacity-80">
                                Rejoint par +2000 toulousains ce mois-ci
                            </div>
                        </div>
                    </motion.div>

                    {/* Brand Video Placeholder (Restored) */}
                    <div className="relative z-10 mt-8 w-full aspect-video rounded-2xl overflow-hidden border-2 border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center group cursor-pointer hover:border-white/40 transition-colors shadow-2xl">
                        <div className="absolute inset-0 bg-zinc-900/50" />
                        <div className="relative z-10 flex flex-col items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                            </div>
                            <span className="text-sm font-bold tracking-widest uppercase mt-2">Découvrir Transpareo</span>
                        </div>
                    </div>
                </div>

                {/* Footer text */}
                <div className="relative z-10 text-xs opacity-50 font-mono">
                    © 2026 Transpareo Inc. • Designed in Toulouse
                </div>
            </motion.div>

            {/* RIGHT SIDE: Form & Interaction */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-black">
                {/* Top Tools */}
                <div className="absolute top-0 right-0 p-8 flex items-center gap-4 z-20">
                    {showBackButton && (
                        <Link href="/" className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                        </Link>
                    )}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 flex items-center justify-center p-8 md:p-16 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
                                {title}
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                                {subtitle}
                            </p>
                        </div>

                        {children}

                    </motion.div>
                </div>
            </div>
        </div>
    );
}

