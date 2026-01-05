"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { createLiveStream } from "@/lib/actions";
// Removed duplicate import

interface GoLiveButtonProps {
    userId?: string;
    variant?: "default" | "icon";
}

export function GoLiveButton({ userId, variant = "default" }: GoLiveButtonProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoLive = async () => {
        if (!userId) return;
        setLoading(true);
        const res = await createLiveStream(userId, title);
        if (res.success) {
            setOpen(false);
            router.push(`/profile/${userId}?live=${res.id}`); // Or dedicated /live/[id] page
            // For MVP let's route to a dedicated page
            router.push(`/live/${res.id}`);
        } else {
            alert("Erreur lors du lancement du live");
        }
        setLoading(false);
    };

    if (!userId) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === "icon" ? (
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full h-9 w-9">
                        <Radio className="h-5 w-5" />
                    </Button>
                ) : (
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg animate-pulse" size="sm">
                        <Radio className="h-4 w-4" />
                        Lancer un Direct
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-red-600" />
                        Démarrer un Live
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Titre du Live</Label>
                        <Input
                            placeholder="De quoi voulez-vous parler ?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button onClick={handleGoLive} disabled={loading || !title} className="bg-red-600 hover:bg-red-700">
                        {loading ? "Lancement..." : "Go Live"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
