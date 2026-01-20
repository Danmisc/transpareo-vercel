"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Send, Link as LinkIcon, Facebook, Twitter, Mail, Quote, Repeat2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/lib/actions";
import { QuotedPostEmbed } from "./QuotedPostEmbed";

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: string;
    postUrl: string;
    // For Quote feature
    postContent?: string;
    postAuthor?: {
        name: string;
        avatar?: string;
        role?: string;
    };
    postCreatedAt?: Date;
    postImage?: string;
    currentUserId?: string;
}

export function ShareDialog({
    open,
    onOpenChange,
    postId,
    postUrl,
    postContent,
    postAuthor,
    postCreatedAt,
    postImage,
    currentUserId
}: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [quoteContent, setQuoteContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState("link");

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

    const handleQuoteRepost = () => {
        if (!currentUserId) {
            toast.error("Connectez-vous pour citer ce post");
            return;
        }

        startTransition(async () => {
            // Create a new post with quotedPostId
            const formData = new FormData();
            formData.append("quotedPostId", postId);

            const res = await createPost(
                currentUserId,
                quoteContent || "↩️",  // Default content if empty
                "TEXT",
                undefined,
                { quotedPostId: postId },
                undefined,
                undefined,
                formData
            );

            if (res.success) {
                toast.success("Post cité avec succès !");
                setQuoteContent("");
                onOpenChange(false);
            } else {
                toast.error(res.error || "Erreur lors du partage");
            }
        });
    };

    const canQuote = currentUserId && postContent && postAuthor;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Partager ce post</DialogTitle>
                    <DialogDescription>
                        Partagez ce post avec vos amis ou citez-le avec votre commentaire.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="link" className="gap-1.5">
                            <LinkIcon className="h-3.5 w-3.5" /> Lien
                        </TabsTrigger>
                        <TabsTrigger value="quote" className="gap-1.5" disabled={!canQuote}>
                            <Quote className="h-3.5 w-3.5" /> Citer
                        </TabsTrigger>
                        <TabsTrigger value="dm" className="gap-1.5">
                            <Send className="h-3.5 w-3.5" /> DM
                        </TabsTrigger>
                    </TabsList>

                    {/* Link & Social Tab */}
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

                    {/* Quote Tab */}
                    <TabsContent value="quote" className="space-y-4 py-4">
                        {canQuote && (
                            <>
                                <Textarea
                                    placeholder="Ajoutez votre commentaire... (optionnel)"
                                    value={quoteContent}
                                    onChange={(e) => setQuoteContent(e.target.value)}
                                    className="min-h-[80px] resize-none"
                                    disabled={isPending}
                                />

                                {/* Preview of quoted post */}
                                <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-2">
                                    <p className="text-xs text-zinc-500 mb-1">Aperçu du post cité:</p>
                                    <QuotedPostEmbed
                                        post={{
                                            id: postId,
                                            content: postContent,
                                            author: postAuthor,
                                            createdAt: postCreatedAt || new Date(),
                                            image: postImage
                                        }}
                                    />
                                </div>

                                <Button
                                    onClick={handleQuoteRepost}
                                    disabled={isPending}
                                    className="w-full"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Publication...
                                        </>
                                    ) : (
                                        <>
                                            <Repeat2 className="h-4 w-4 mr-2" />
                                            Citer ce post
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </TabsContent>

                    {/* DM Tab */}
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

