"use client";

import { motion } from "framer-motion";
import { User, CheckCircle2, QrCode, Shield } from "lucide-react";

interface DossierIdCardProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
    isVerified: boolean;
}

export function DossierIdCard({ user, isVerified }: DossierIdCardProps) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-[340px] aspect-[1.586] rounded-xl overflow-hidden shadow-2xl bg-zinc-900 text-white p-5 border border-zinc-800/50 group hover:scale-[1.02] transition-transform duration-500 ease-out"
        >
            {/* Professional Mesh Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-zinc-900/0 to-zinc-900/0 opacity-60" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Shield size={14} className="text-orange-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 tracking-[0.2em] uppercase">Digital ID</span>
                </div>
                {isVerified ? (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md text-[9px] font-bold border border-emerald-500/20 backdrop-blur-md uppercase tracking-wider">
                        <CheckCircle2 size={10} />
                        Vérifié
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-md text-[9px] font-bold border border-orange-500/20 backdrop-blur-md uppercase tracking-wider">
                        En Attente
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex gap-4 items-end relative z-10">
                <div className="relative group-hover:ring-2 ring-orange-500/50 rounded-lg transition-all duration-300">
                    <div className="w-[72px] h-[72px] rounded-lg bg-zinc-800 overflow-hidden border border-white/10 shadow-lg">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <User size={28} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-2 pb-1">
                    <div>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium">Titulaire</p>
                        <p className="font-bold text-base text-zinc-100 leading-none">{user.name}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium">Contact</p>
                        <p className="text-xs font-medium text-zinc-400 truncate">{user.email}</p>
                    </div>
                </div>

                <div className="flex-shrink-0 self-end">
                    <div className="w-10 h-10 bg-white rounded-md p-0.5">
                        <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                            <QrCode size={20} className="text-zinc-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Lines */}
            <div className="absolute bottom-5 right-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        </motion.div>
    );
}

