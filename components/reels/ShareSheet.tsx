"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link2, Mail, MessageSquare, Send, Download, Flag } from "lucide-react";

interface ShareSheetProps {
    post: any;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareSheet({ post, isOpen, onClose }: ShareSheetProps) {

    const handleCopyLink = () => {
        const url = `${window.location.origin}/reels/${post.id}`;
        navigator.clipboard.writeText(url);
        // Toast
        onClose();
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-auto max-h-[50vh] rounded-t-3xl bg-zinc-900 border-zinc-800 pb-8">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-white text-center text-sm">Partager vers</SheetTitle>
                </SheetHeader>

                <div className="grid grid-cols-4 gap-4 px-2">
                    <ShareOption
                        icon={Link2}
                        label="Copier lien"
                        color="bg-zinc-800"
                        onClick={handleCopyLink}
                    />
                    <ShareOption
                        icon={MessageSquare}
                        label="SMS"
                        color="bg-green-600"
                    />
                    <ShareOption
                        icon={Send}
                        label="Telegram"
                        color="bg-blue-500"
                    />
                    <ShareOption
                        icon={Mail}
                        label="Email"
                        color="bg-yellow-600"
                    />
                    <ShareOption
                        icon={Download}
                        label="Enregistrer"
                        color="bg-zinc-700"
                    />
                    <ShareOption
                        icon={Flag}
                        label="Signaler"
                        color="bg-red-900/50"
                        textColor="text-red-400"
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

function ShareOption({ icon: Icon, label, color, textColor, onClick }: any) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition transform group-active:scale-90 ${color}`}>
                <Icon size={24} />
            </div>
            <span className={`text-xs ${textColor || "text-zinc-400"}`}>{label}</span>
        </button>
    );
}
