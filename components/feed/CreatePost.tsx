"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, MapPin, Calendar, Users, Send, Hash, FileVideo, BarChart2, Home, Eye, Edit3, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ImageUpload } from "@/components/ui/image-upload";
import { createPost } from "@/lib/actions";
import { UserProfile } from "@/lib/types";

type PostType = "TEXT" | "MEDIA" | "VIDEO" | "POLL" | "PROPERTY";

interface CreatePostProps {
    currentUser?: UserProfile;
}

export function CreatePost({ currentUser }: CreatePostProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState<PostType>("TEXT");
    const [isPreview, setIsPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVideoUploading, setIsVideoUploading] = useState(false);

    // Dynamic Fields
    const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [propertyDetails, setPropertyDetails] = useState({ price: "", location: "", surface: "", rooms: "" });

    const handleCreate = async () => {
        if (!content && postType === "TEXT") return;
        if (!currentUser?.id) return;

        setIsSubmitting(true);

        // Prep metadata
        let metadata: any = {};
        if (postType === "POLL") {
            metadata = { options: pollOptions.filter(o => o.trim()) };
        } else if (postType === "PROPERTY") {
            metadata = { ...propertyDetails };
        }

        const res = await createPost(
            currentUser.id,
            content,
            postType,
            mediaUrl,
            metadata
        );

        if (res.success) {
            // Reset
            setContent("");
            setMediaUrl(undefined);
            setPollOptions(["", ""]);
            setPropertyDetails({ price: "", location: "", surface: "", rooms: "" });
            setPostType("TEXT");
            setIsExpanded(false);
        } else {
            alert("Erreur lors de la publication");
        }
        setIsSubmitting(false);
    };

    const updatePollOption = (idx: number, val: string) => {
        const newOpts = [...pollOptions];
        newOpts[idx] = val;
        setPollOptions(newOpts);
    };

    return (
        <Card className="glass-card">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10 cursor-pointer hover:opacity-90">
                        <AvatarImage src={currentUser?.avatar || "/avatars/default.png"} alt="@user" />
                        <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                        {/* Compact Input */}
                        {!isExpanded && (
                            <div className="relative" onClick={() => setIsExpanded(true)}>
                                <textarea
                                    placeholder="Quoi de neuf dans l'immo ?"
                                    className="w-full h-10 resize-none bg-transparent placeholder:text-muted-foreground focus:outline-none min-h-[40px] text-base overflow-hidden"
                                    readOnly
                                />
                            </div>
                        )}

                        {/* Expanded Editor */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Type Selector */}
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/50 overflow-x-auto scrollbar-none">
                                        {(["TEXT", "MEDIA", "VIDEO", "POLL", "PROPERTY"] as PostType[]).map(type => (
                                            <Button
                                                key={type}
                                                variant={postType === type ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setPostType(type)}
                                                className="h-7 text-xs gap-1.5"
                                            >
                                                {type === "TEXT" && <Edit3 className="h-3.5 w-3.5" />}
                                                {type === "MEDIA" && <Image className="h-3.5 w-3.5" />}
                                                {type === "VIDEO" && <FileVideo className="h-3.5 w-3.5" />}
                                                {type === "POLL" && <BarChart2 className="h-3.5 w-3.5" />}
                                                {type === "PROPERTY" && <Home className="h-3.5 w-3.5" />}
                                                {type === "TEXT" ? "Discussion" : type === "MEDIA" ? "Photo" : type === "VIDEO" ? "Vidéo" : type === "POLL" ? "Sondage" : "Immobilier"}
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Editor Area */}
                                    <div className="relative min-h-[100px]">
                                        <textarea
                                            placeholder={
                                                postType === "POLL" ? "Posez votre question de sondage..." :
                                                    postType === "PROPERTY" ? "Titre de l'annonce..." :
                                                        "Quoi de neuf ? (Markdown supporté)"
                                            }
                                            className="w-full resize-none bg-transparent placeholder:text-muted-foreground focus:outline-none min-h-[100px] text-base"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Conditional Inputs */}
                                    {(postType === "MEDIA" || postType === "PROPERTY") && (
                                        <div className="space-y-2 animate-in fade-in zoom-in-95">
                                            <span className="text-xs font-semibold text-muted-foreground">Image principale</span>
                                            <ImageUpload
                                                value={mediaUrl}
                                                onChange={setMediaUrl}
                                                onRemove={() => setMediaUrl(undefined)}
                                            />
                                        </div>
                                    )}

                                    {postType === "VIDEO" && (
                                        <div className="space-y-2 animate-in fade-in zoom-in-95">
                                            <span className="text-xs font-semibold text-muted-foreground">Vidéo (MP4, WebM)</span>
                                            <div className="border border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors relative">
                                                {isVideoUploading ? (
                                                    <div className="flex flex-col items-center justify-center py-4">
                                                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                                        <span className="text-xs text-muted-foreground">Envoi de la vidéo...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            className="hidden"
                                                            id="video-upload"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setIsVideoUploading(true);
                                                                    const formData = new FormData();
                                                                    formData.append("file", file);

                                                                    try {
                                                                        const { uploadFile } = await import("@/lib/upload");
                                                                        const res = await uploadFile(formData);
                                                                        if (res.success && res.url) {
                                                                            setMediaUrl(res.url);
                                                                        } else {
                                                                            alert("Erreur lors de l'envoi de la vidéo");
                                                                        }
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert("Erreur technique lors de l'upload");
                                                                    } finally {
                                                                        setIsVideoUploading(false);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor="video-upload" className="cursor-pointer block w-full h-full">
                                                            {mediaUrl ? (
                                                                <div className="text-sm text-primary break-all flex items-center justify-center gap-2">
                                                                    <FileVideo className="h-4 w-4" />
                                                                    Vidéo ajoutée !
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                                    <FileVideo className="h-8 w-8" />
                                                                    <span className="text-sm">Cliquez pour ajouter une vidéo</span>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </>
                                                )}

                                                {mediaUrl && !isVideoUploading && (
                                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                                        e.preventDefault();
                                                        setMediaUrl(undefined);
                                                    }} className="absolute top-2 right-2 h-6 w-6 rounded-full text-destructive p-0">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {postType === "POLL" && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <span className="text-xs font-semibold text-muted-foreground">Options de réponse</span>
                                            {pollOptions.map((opt, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        className="flex-1 bg-muted/50 rounded-md px-3 py-1.5 text-sm border-none focus:ring-1 ring-primary"
                                                        placeholder={`Option ${i + 1}`}
                                                        value={opt}
                                                        onChange={(e) => updatePollOption(i, e.target.value)}
                                                    />
                                                    {pollOptions.length > 2 && (
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" className="w-full text-xs dashed" onClick={() => setPollOptions([...pollOptions, ""])}>
                                                <Plus className="h-3 w-3 mr-2" /> Ajouter une option
                                            </Button>
                                        </div>
                                    )}

                                    {postType === "PROPERTY" && (
                                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                                            <input
                                                className="bg-muted/50 rounded-md px-3 py-1.5 text-sm" placeholder="Prix (ex: 350 000€)"
                                                value={propertyDetails.price} onChange={(e) => setPropertyDetails({ ...propertyDetails, price: e.target.value })}
                                            />
                                            <input
                                                className="bg-muted/50 rounded-md px-3 py-1.5 text-sm" placeholder="Ville (ex: Lyon)"
                                                value={propertyDetails.location} onChange={(e) => setPropertyDetails({ ...propertyDetails, location: e.target.value })}
                                            />
                                            <input
                                                className="bg-muted/50 rounded-md px-3 py-1.5 text-sm" placeholder="Surface (ex: 85m²)"
                                                value={propertyDetails.surface} onChange={(e) => setPropertyDetails({ ...propertyDetails, surface: e.target.value })}
                                            />
                                            <input
                                                className="bg-muted/50 rounded-md px-3 py-1.5 text-sm" placeholder="Pièces (ex: 4)"
                                                value={propertyDetails.rooms} onChange={(e) => setPropertyDetails({ ...propertyDetails, rooms: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between border-t pt-3">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>Annuler</Button>
                                            <Button
                                                size="sm"
                                                className="bg-primary hover:bg-primary/90 min-w-[100px]"
                                                onClick={handleCreate}
                                                disabled={isSubmitting || (!content && postType === "TEXT")}
                                            >
                                                {isSubmitting ? "Envoi..." : "Publier"}
                                                {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
