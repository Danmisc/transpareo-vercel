"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, MapPin, BarChart2, Video, Send, X, Loader2, Smile, FileVideo, Edit3, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createPost } from "@/lib/actions";
import { UserProfile } from "@/lib/types";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";

type PostType = "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "PROPERTY";

interface CreatePostProps {
    currentUser?: UserProfile;
}

export function CreatePost({ currentUser }: CreatePostProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState<PostType>("TEXT");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Fields
    const [mediaUrls, setMediaUrls] = useState<string[]>([]); // Array of URLs
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [propertyDetails, setPropertyDetails] = useState({ price: "", location: "", surface: "", rooms: "" });
    const [isVideoUploading, setIsVideoUploading] = useState(false);

    const handleCreate = async () => {
        if (!content.trim() && postType === "TEXT" && mediaUrls.length === 0) return;
        if (!currentUser?.id) return;

        setIsSubmitting(true);

        // Prep metadata
        let metadata: any = {};
        if (postType === "POLL") {
            metadata = { options: pollOptions.filter(o => o.trim()) };
        } else if (postType === "PROPERTY") {
            metadata = { ...propertyDetails };
        }

        try {
            const res = await createPost(
                currentUser.id,
                content,
                postType,
                mediaUrls.length > 0 ? mediaUrls[0] : undefined, // Primary image
                metadata,
                undefined,
                propertyDetails.location || undefined,
                undefined, // formData handled differently if needed, but here we pass URLs
                mediaUrls // Pass full array
            );

            if (res.success) {
                setContent("");
                setMediaUrls([]);
                setPollOptions(["", ""]);
                setPropertyDetails({ price: "", location: "", surface: "", rooms: "" });
                setIsExpanded(false);
                // toast.success("Post publié !");
            } else {
                // toast.error(res.error || "Erreur lors de la publication");
            }
        } catch (error) {
            console.error(error);
            // toast.error("Erreur inattendue");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updatePollOption = (idx: number, val: string) => {
        const newOpts = [...pollOptions];
        newOpts[idx] = val;
        setPollOptions(newOpts);
    };

    return (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl mb-6 overflow-hidden transition-all duration-300 hover:border-zinc-300/80 dark:hover:border-zinc-700">
            <CardContent className="p-5">
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10 border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:opacity-90">
                        <AvatarImage src={currentUser?.avatar || "/avatars/default.svg"} alt="@user" />
                        <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                        {/* Compact Input */}
                        {!isExpanded && (
                            <div className="relative" onClick={() => setIsExpanded(true)}>
                                <textarea
                                    placeholder="Quoi de neuf dans l'immo ?"
                                    className="w-full h-10 resize-none bg-transparent placeholder:text-zinc-500 focus:outline-none min-h-[44px] text-[15px] pt-2 overflow-hidden cursor-text"
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
                                    {/* Editor Area */}
                                    <textarea
                                        placeholder={postType === "POLL" ? "Votre question..." : "Partagez votre actualité..."}
                                        className="w-full resize-none bg-transparent placeholder:text-zinc-400 focus:outline-none min-h-[100px] text-[15px] leading-relaxed"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        autoFocus
                                    />

                                    {/* Type Specific Inputs */}
                                    {postType === "POLL" && (
                                        <div className="space-y-2 pl-1 border-l-2 border-orange-500/20">
                                            {pollOptions.map((opt, i) => (
                                                <input
                                                    key={i}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={(e) => updatePollOption(i, e.target.value)}
                                                />
                                            ))}
                                            <Button variant="ghost" size="sm" className="text-xs text-orange-600" onClick={() => setPollOptions([...pollOptions, ""])}>
                                                + Ajouter une option
                                            </Button>
                                        </div>
                                    )}

                                    {postType === "PROPERTY" && (
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                                placeholder="Prix (€)"
                                                type="number"
                                                value={propertyDetails.price}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, price: e.target.value })}
                                            />
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                                placeholder="Ville / Quartier"
                                                value={propertyDetails.location}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, location: e.target.value })}
                                            />
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                                placeholder="Surface (m²)"
                                                type="number"
                                                value={propertyDetails.surface}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, surface: e.target.value })}
                                            />
                                            <input
                                                className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                                placeholder="Pièces"
                                                type="number"
                                                value={propertyDetails.rooms}
                                                onChange={(e) => setPropertyDetails({ ...propertyDetails, rooms: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {(postType === "IMAGE" || postType === "PROPERTY" || postType === "VIDEO") && (
                                        <div className="p-1">
                                            <MultiImageUpload
                                                value={mediaUrls}
                                                onChange={(urls) => setMediaUrls(urls)}
                                                onRemove={(url) => setMediaUrls(mediaUrls.filter(u => u !== url))}
                                                maxFiles={4}
                                                accept={postType === "VIDEO" ? "video/*" : "image/*"}
                                            />
                                        </div>
                                    )}

                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex gap-1">
                                            <IconButton icon={Image} active={postType === "IMAGE"} onClick={() => setPostType("IMAGE")} label="Photo" />
                                            <IconButton icon={Video} active={postType === "VIDEO"} onClick={() => setPostType("VIDEO")} label="Vidéo" />
                                            <IconButton icon={BarChart2} active={postType === "POLL"} onClick={() => setPostType("POLL")} label="Sondage" />
                                            <IconButton icon={Home} active={postType === "PROPERTY"} onClick={() => setPostType("PROPERTY")} label="Immo" />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isSubmitting ? (
                                                <Button disabled className="rounded-full px-6 bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="rounded-full text-zinc-500">
                                                        Annuler
                                                    </Button>
                                                    <Button onClick={handleCreate} className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black font-bold px-6">
                                                        Publier <Send className="w-3 h-3 ml-2" />
                                                    </Button>
                                                </>
                                            )}
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

function IconButton({ icon: Icon, onClick, active, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-2 rounded-full transition-all flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                active && "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
            )}
            title={label}
        >
            <Icon size={18} />
        </button>
    );
}

