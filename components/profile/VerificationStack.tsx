"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, FileCheck, Shield, Clock, AlertCircle, Fingerprint, Receipt, Briefcase, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface VerificationItem {
    id: string;
    label: string;
    status: "verified" | "pending" | "expired" | "missing";
    date?: string;
    icon: any;
    category: "IDENTITY" | "FINANCE" | "WORK";
}

import Link from "next/link"; // NEW

export function VerificationStack({ isOwner }: { isOwner: boolean }) {
    const documents: VerificationItem[] = [
        { id: "1", label: "Pièce d'identité", status: "verified", date: "Jan 2024", icon: Fingerprint, category: "IDENTITY" },
        { id: "2", label: "Selfie Vidéo", status: "verified", date: "Jan 2024", icon: Shield, category: "IDENTITY" },
        { id: "3", label: "Avis d'imposition", status: "verified", date: "Déc 2023", icon: Receipt, category: "FINANCE" },
        { id: "4", label: "Revenus (3 derniers mois)", status: "pending", date: "En cours", icon: FileCheck, category: "FINANCE" },
        { id: "5", label: "Contrat de travail", status: "verified", date: "Nov 2023", icon: Briefcase, category: "WORK" },
    ];

    const categories = [
        { id: "IDENTITY", label: "Identité", icon: Shield, desc: "Prouvez qui vous êtes" },
        { id: "FINANCE", label: "Finances", icon: Receipt, desc: "Justifiez vos revenus" },
        { id: "WORK", label: "Professionnel", icon: Briefcase, desc: "Votre situation actuelle" }
    ];

    return (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl h-full overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="relative flex h-3 w-3 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Dossier de Vérification
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Documents certifiés conformes
                        </CardDescription>
                    </div>
                    {isOwner && (
                        <Link href="/p2p/settings/kyc">
                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                                <Plus className="w-3 h-3" />
                                Ajouter
                            </Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-6">

                {categories.map((cat, index) => {
                    const catDocs = documents.filter(d => d.category === cat.id);
                    return (
                        <div key={cat.id} className="space-y-3">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                                <cat.icon className="w-3.5 h-3.5" />
                                {cat.label}
                            </h4>

                            <div className="space-y-2">
                                {catDocs.map((doc, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 + i * 0.05 }}
                                        key={doc.id}
                                        className="group flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                                doc.status === "verified"
                                                    ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 text-green-600"
                                                    : doc.status === "pending"
                                                        ? "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-600"
                                                        : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-600"
                                            )}>
                                                <doc.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                                                    {doc.label}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-medium flex items-center gap-1",
                                                    doc.status === "verified" ? "text-green-600" : doc.status === "pending" ? "text-amber-600" : "text-red-500"
                                                )}>
                                                    {doc.status === "verified" && <CheckCircle2 className="w-3 h-3" />}
                                                    {doc.status === "pending" && <Clock className="w-3 h-3" />}
                                                    {doc.status === "expired" && <AlertCircle className="w-3 h-3" />}

                                                    {doc.status === "verified" ? "Vérifié" : doc.status === "pending" ? "Analyse en cours" : "Expiré"}
                                                    {doc.date && ` • ${doc.date}`}
                                                </span>
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <Link href="/p2p/settings/kyc">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-300 hover:text-blue-600">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}
                                {catDocs.length === 0 && (
                                    <div className="text-center py-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                                        <p className="text-xs text-zinc-400">Aucun document</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

            </CardContent>
        </Card>
    );
}
