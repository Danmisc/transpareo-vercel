"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Send, Link as LinkIcon, Facebook, Twitter, Mail } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: string;
    postUrl: string; // Absolute URL to post
}

export function ShareDialog({ open, onOpenChange, postId, postUrl }: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCopy = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        toast.success("Lien copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareExternal = (platform: string) => {
        let url = "";
        const text = encodeURIComponent("Regarde ce post sur Transpareo !");
        const link = encodeURIComponent(postUrl);

        switch (platform) {
            case "twitter":
                url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
                break;
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
                break;
            case "email":
                url = `mailto:?subject=${text}&body=${link}`;
                break;
        }
        if (url) window.open(url, "_blank");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Partager ce post</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="link" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="link">Lien & Réseaux</TabsTrigger>
                        <TabsTrigger value="dm">Message Privé</TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-4 py-4">
                        <div className="flex space-x-2">
                            <Input value={postUrl} readOnly className="bg-muted" />
                            <Button size="icon" variant="outline" onClick={handleCopy}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="flex flex-col gap-1 h-16" onClick={() => handleShareExternal("twitter")}>
                                <Twitter className="h-5 w-5" />
                                <span className="text-xs">Twitter</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col gap-1 h-16" onClick={() => handleShareExternal("facebook")}>
                                <Facebook className="h-5 w-5" />
                                <span className="text-xs">Facebook</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col gap-1 h-16" onClick={() => handleShareExternal("email")}>
                                <Mail className="h-5 w-5" />
                                <span className="text-xs">Email</span>
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="dm" className="space-y-4 py-4">
                        <div className="relative">
                            <Input
                                placeholder="Rechercher un ami..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm border rounded-md bg-muted/20">
                            Recherche de contacts à venir...
                        </div>
                        <Button className="w-full" disabled>
                            <Send className="mr-2 h-4 w-4" /> Envoyer (Bientôt)
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
