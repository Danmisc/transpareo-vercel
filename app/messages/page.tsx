"use client";

import { MessageSquare, Search, Users, ArrowRight, ShieldCheck, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateGroupDialog } from "@/components/messages/CreateGroupDialog";
import { CreateChannelDialog } from "@/components/messages/CreateChannelDialog";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function MessagesPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "chat";

    return (
        <div className="hidden md:flex flex-col items-center justify-center h-full bg-white dark:bg-zinc-950">

            <div className="max-w-md w-full px-6 flex flex-col items-center text-center space-y-10">

                {/* Visual Identity (VSCode Style) */}
                <div className="flex flex-col items-center gap-6">
                    {activeTab === "channels" ? (
                        <Hash size={80} strokeWidth={1} className="text-zinc-200 dark:text-zinc-800" />
                    ) : (
                        <MessageSquare size={80} strokeWidth={1} className="text-zinc-200 dark:text-zinc-800" />
                    )}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            {activeTab === "channels" ? "Salons" : "Messagerie"}
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            {activeTab === "channels" ? "Rejoignez des espaces thématiques" : "Gérez vos communications en toute simplicité"}
                        </p>
                    </div>
                </div>

                {/* Quick Actions (SaaS Style) */}
                <div className="grid grid-cols-1 w-full gap-3">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center justify-between w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                {activeTab === "channels" ? <Hash size={20} /> : <Search size={20} />}
                            </div>
                            <div className="text-left">
                                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    {activeTab === "channels" ? "Nouveau Salon" : "Nouvelle discussion"}
                                </span>
                                <span className="block text-xs text-zinc-500">
                                    {activeTab === "channels" ? "Créer un espace communautaire" : "Rechercher un contact pour discuter"}
                                </span>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </button>

                    <Link
                        href="/communities"
                        className="flex items-center justify-between w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Users size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Communauté</span>
                                <span className="block text-xs text-zinc-500">Explorer les groupes publics</span>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </Link>
                </div>

                {/* Secure Footer (Minimal) */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-8">
                    <ShieldCheck size={14} />
                    <span>Messagerie sécurisée et chiffrée</span>
                </div>
            </div>

            {activeTab === "channels" ? (
                <CreateChannelDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    onSuccess={() => {/* Router push handled by dialog */ }}
                />
            ) : (
                <CreateGroupDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    onSuccess={() => {/* Router push handled by dialog */ }}
                />
            )}
        </div>
    );
}
